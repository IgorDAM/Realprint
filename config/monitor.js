const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf } = format;

// Configuración del logger
const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp(),
        printf(({ level, message, timestamp, ...metadata }) => {
            let msg = `${timestamp} ${level}: ${message}`;
            if (Object.keys(metadata).length > 0) {
                msg += ` ${JSON.stringify(metadata)}`;
            }
            return msg;
        })
    ),
    transports: [
        new transports.File({ 
            filename: 'logs/error.log', 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        new transports.File({ 
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        })
    ]
});

// Función para monitorear el uso de memoria
const monitorMemory = () => {
    const used = process.memoryUsage();
    logger.info('Uso de memoria', {
        rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(used.external / 1024 / 1024)}MB`
    });
};

// Función para monitorear el CPU
const monitorCPU = () => {
    const startUsage = process.cpuUsage();
    setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        logger.info('Uso de CPU', {
            user: `${endUsage.user / 1000}ms`,
            system: `${endUsage.system / 1000}ms`
        });
    }, 1000);
};

// Función para monitorear las conexiones de la base de datos
const monitorDBConnections = async () => {
    try {
        const { query } = require('../db/conexion');
        const [result] = await query('SHOW STATUS WHERE Variable_name = "Threads_connected"');
        logger.info('Conexiones de base de datos', {
            connections: result[0].Value
        });
    } catch (error) {
        logger.error('Error al monitorear conexiones de base de datos', {
            error: error.message,
            stack: error.stack
        });
    }
};

// Función principal de monitoreo
const monitorSystem = () => {
    monitorMemory();
    monitorCPU();
    monitorDBConnections();
};

module.exports = {
    logger,
    monitorSystem
}; 