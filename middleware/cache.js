const NodeCache = require('node-cache');
const cache = new NodeCache({
    stdTTL: 600, // Tiempo de vida por defecto: 10 minutos
    checkperiod: 120 // Verificar cada 2 minutos
});

// Middleware de caché para rutas GET
const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        // Solo cachear peticiones GET
        if (req.method !== 'GET') {
            return next();
        }

        const key = req.originalUrl || req.url;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            return res.send(cachedResponse);
        }

        // Interceptar la respuesta para guardarla en caché
        res.originalSend = res.send;
        res.send = (body) => {
            cache.set(key, body, duration);
            res.originalSend(body);
        };

        next();
    };
};

// Función para invalidar caché
const invalidateCache = (pattern) => {
    const keys = cache.keys();
    const regex = new RegExp(pattern);
    
    keys.forEach(key => {
        if (regex.test(key)) {
            cache.del(key);
        }
    });
};

// Función para limpiar toda la caché
const clearCache = () => {
    cache.flushAll();
};

module.exports = {
    cacheMiddleware,
    invalidateCache,
    clearCache
}; 