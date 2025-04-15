const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf } = format;

// Configuración del logger
const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        printf(({ level, message, timestamp, ...metadata }) => {
            let msg = `${timestamp} [${level}] : ${message}`;
            if (Object.keys(metadata).length > 0) {
                msg += ` ${JSON.stringify(metadata)}`;
            }
            return msg;
        })
    ),
    transports: [
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        })
    ]
});

// Middleware para logging de peticiones
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('Petición HTTP', {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent')
        });
    });

    next();
};

// Middleware para logging de errores
const errorLogger = (err, req, res, next) => {
    logger.error('Error en la aplicación', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    next(err);
};

// Función para monitorear uso de recursos
const monitorResources = () => {
    const used = process.memoryUsage();
    logger.info('Uso de memoria', {
        rss: `${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`,
        heapTotal: `${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`,
        heapUsed: `${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`,
        external: `${Math.round(used.external / 1024 / 1024 * 100) / 100} MB`
    });
};

// Función para monitorear rendimiento de la base de datos
const monitorDatabase = async (pool) => {
    try {
        const [rows] = await pool.query('SHOW STATUS');
        const metrics = rows.reduce((acc, row) => {
            acc[row.Variable_name] = row.Value;
            return acc;
        }, {});

        logger.info('Métricas de base de datos', {
            connections: metrics.Threads_connected,
            queries: metrics.Queries,
            slowQueries: metrics.Slow_queries,
            uptime: metrics.Uptime
        });
    } catch (error) {
        logger.error('Error al monitorear base de datos', { error: error.message });
    }
};

// Función para generar reportes de rendimiento
const generatePerformanceReport = () => {
    const report = {
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime()
    };

    logger.info('Reporte de rendimiento', report);
    return report;
};

module.exports = {
    logger,
    requestLogger,
    errorLogger,
    monitorResources,
    monitorDatabase,
    generatePerformanceReport
}; 