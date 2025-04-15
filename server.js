require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const cache = require('memory-cache');
const prometheus = require('prom-client');
const csrf = require('csurf');
const sanitizeHtml = require('sanitize-html');
const { query } = require('./db/conexion');
const adminRoutes = require('./api/admin');
const pagosRoutes = require('./api/pagos');
const notificacionesRoutes = require('./api/notificaciones');
const operarioRoutes = require('./api/operario');
const jefeProduccionRoutes = require('./api/jefe-produccion');
const https = require('https');

// Configuración de métricas Prometheus
const httpRequestDuration = new prometheus.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code']
});

const app = express();

// Middleware de métricas
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        httpRequestDuration
            .labels(req.method, req.route?.path || req.path, res.statusCode)
            .observe(duration);
    });
    next();
});

// Configuración de seguridad
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    }
}));

// Configuración de CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://realprint.com'] 
        : ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Configuración de CSRF
app.use(csrf({ cookie: true }));

// Limitar peticiones
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 peticiones por IP
});

// Rate limiting específico para rutas sensibles
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: 'Demasiados intentos de autenticación, por favor intenta más tarde'
});

app.use('/api/auth', authLimiter);
app.use(limiter);

// Compresión
app.use(compression());

// Logging
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));

// Middleware para parsear JSON
app.use(express.json({ limit: '10kb' }));

// Middleware para parsear URL-encoded
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Middleware de sanitización
app.use((req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitizeHtml(req.body[key], {
                    allowedTags: [],
                    allowedAttributes: {}
                });
            }
        });
    }
    next();
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist'), {
    maxAge: '1y',
    etag: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

// Ruta de registro con validación
app.post('/api/auth/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body('nombre').trim().notEmpty(),
    body('apellidos').trim().notEmpty(),
    body('telefono').isMobilePhone(),
    body('direccion').trim().notEmpty(),
    body('pais').trim().notEmpty(),
    body('ciudad').trim().notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nombre, apellidos, email, telefono, direccion, pais, ciudad, password } = req.body;

        // Verificar si el email ya existe
        const [existingUsers] = await query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar nuevo usuario
        const [result] = await query(`
            INSERT INTO usuarios (
                nombre, apellidos, email, telefono, direccion, 
                pais, ciudad, password, rol, estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'CLI', 'Activo')
        `, [nombre, apellidos, email, telefono, direccion, pais, ciudad, hashedPassword]);

        res.status(201).json({ 
            message: 'Usuario registrado correctamente',
            id: result.insertId 
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// Rutas de autenticación con validación
app.post('/api/auth/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const [users] = await query('SELECT * FROM usuarios WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            token, 
            user: { 
                id: user.id, 
                nombre: user.nombre, 
                rol: user.rol 
            } 
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para métricas Prometheus
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', prometheus.register.contentType);
    res.end(await prometheus.register.metrics());
});

// Rutas de la API
app.use('/api/auth', require('./api/auth'));
app.use('/api/users', require('./api/users'));
app.use('/api/orders', require('./api/orders'));
app.use('/api/machines', require('./api/machines'));
app.use('/api/tasks', require('./api/tasks'));

// Montar rutas
app.use('/api/admin', adminRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/notificaciones', notificacionesRoutes.router);
app.use('/api/operario', operarioRoutes);
app.use('/api/jefe-produccion', jefeProduccionRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Algo salió mal en el servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Ruta no encontrada'
    });
});

// Redirección HTTPS
app.use((req, res, next) => {
    if (!req.secure) {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

// Configuración HTTPS
const options = {
    key: fs.readFileSync('cert/key.pem'),
    cert: fs.readFileSync('cert/cert.pem')
};

// Iniciar servidor HTTPS
https.createServer(options, app).listen(443, () => {
    console.log('Servidor HTTPS iniciado en el puerto 443');
});

// Redirección HTTP a HTTPS
const http = require('http');
http.createServer((req, res) => {
    res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
    res.end();
}).listen(80, () => {
    console.log('Servidor HTTP iniciado en el puerto 80');
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
    console.error('Error no capturado:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada no manejada:', reason);
});

// Cierre limpio del servidor
process.on('SIGTERM', () => {
    console.log('Recibida señal SIGTERM, cerrando servidor...');
    server.close(() => {
        console.log('Servidor cerrado');
        process.exit(0);
    });
}); 