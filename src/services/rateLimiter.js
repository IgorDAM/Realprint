import { getEnv } from './env.js';
import { logger } from './logger.js';

// Almacenamiento temporal para las solicitudes
const requestStore = new Map();

/**
 * Limpia las solicitudes antiguas
 * @param {number} windowMs - Ventana de tiempo en milisegundos
 */
function cleanupOldRequests(windowMs) {
    const now = Date.now();
    for (const [key, requests] of requestStore.entries()) {
        const validRequests = requests.filter(time => now - time < windowMs);
        if (validRequests.length === 0) {
            requestStore.delete(key);
        } else {
            requestStore.set(key, validRequests);
        }
    }
}

/**
 * Verifica si una solicitud excede el límite
 * @param {string} key - Clave única para el cliente
 * @param {number} maxRequests - Número máximo de solicitudes
 * @param {number} windowMs - Ventana de tiempo en milisegundos
 * @returns {boolean} true si la solicitud está permitida
 */
export function checkRateLimit(key, maxRequests, windowMs) {
    const now = Date.now();
    const requests = requestStore.get(key) || [];
    
    // Limpiar solicitudes antiguas
    cleanupOldRequests(windowMs);
    
    // Verificar si se excede el límite
    if (requests.length >= maxRequests) {
        const oldestRequest = requests[0];
        if (now - oldestRequest < windowMs) {
            return false;
        }
        requests.shift();
    }
    
    // Registrar la nueva solicitud
    requests.push(now);
    requestStore.set(key, requests);
    
    return true;
}

/**
 * Middleware para limitar las solicitudes
 * @param {Object} options - Opciones de configuración
 * @returns {Function} Middleware
 */
export function createRateLimiter(options = {}) {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutos por defecto
        maxRequests = 100, // 100 solicitudes por defecto
        keyGenerator = req => req.ip, // IP por defecto
        message = 'Demasiadas solicitudes, por favor intenta más tarde'
    } = options;

    return async (req, res, next) => {
        try {
            const key = keyGenerator(req);
            const allowed = checkRateLimit(key, maxRequests, windowMs);

            if (!allowed) {
                res.status(429).json({ error: message });
                return;
            }

            next();
        } catch (error) {
            logger.error('Error en rate limiter:', error);
            next(error);
        }
    };
}

/**
 * Inicializa el rate limiter con configuración desde variables de entorno
 * @returns {Function} Middleware de rate limiting
 */
export async function initializeRateLimiter() {
    try {
        const config = await getMultipleEnv([
            'RATE_LIMIT_WINDOW',
            'RATE_LIMIT_MAX_REQUESTS'
        ]);

        return createRateLimiter({
            windowMs: parseInt(config.RATE_LIMIT_WINDOW) * 60 * 1000,
            maxRequests: parseInt(config.RATE_LIMIT_MAX_REQUESTS)
        });
    } catch (error) {
        logger.error('Error al inicializar rate limiter:', error);
        return createRateLimiter(); // Usar valores por defecto
    }
}

/**
 * Limpia el almacenamiento de solicitudes
 */
export function cleanup() {
    requestStore.clear();
}

// Limpiar el almacenamiento cada hora
setInterval(cleanup, 60 * 60 * 1000); 