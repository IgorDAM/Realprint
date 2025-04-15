import { logger } from './logger.js';

/**
 * Sanitiza un string para prevenir XSS
 * @param {string} str - String a sanitizar
 * @returns {string} String sanitizado
 */
export function sanitizeString(str) {
    if (typeof str !== 'string') {
        return str;
    }

    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Sanitiza un objeto completo
 * @param {Object} obj - Objeto a sanitizar
 * @returns {Object} Objeto sanitizado
 */
export function sanitizeObject(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
}

/**
 * Verifica si un string contiene código malicioso
 * @param {string} str - String a verificar
 * @returns {boolean} true si contiene código malicioso
 */
export function hasMaliciousCode(str) {
    if (typeof str !== 'string') {
        return false;
    }

    const maliciousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /data:text\/html/gi,
        /vbscript:/gi,
        /expression\s*\(/gi,
        /url\s*\(/gi
    ];

    return maliciousPatterns.some(pattern => pattern.test(str));
}

/**
 * Middleware para protección XSS
 * @returns {Function} Middleware
 */
export function createXSSProtection() {
    return (req, res, next) => {
        try {
            // Sanitizar query parameters
            if (req.query) {
                req.query = sanitizeObject(req.query);
            }

            // Sanitizar body
            if (req.body) {
                req.body = sanitizeObject(req.body);
            }

            // Sanitizar params
            if (req.params) {
                req.params = sanitizeObject(req.params);
            }

            // Verificar headers
            for (const [key, value] of Object.entries(req.headers)) {
                if (hasMaliciousCode(value)) {
                    logger.warn('Intento de XSS detectado en headers', {
                        header: key,
                        value: value
                    });
                    res.status(400).json({ error: 'Contenido malicioso detectado' });
                    return;
                }
            }

            next();
        } catch (error) {
            logger.error('Error en protección XSS:', error);
            next(error);
        }
    };
}

/**
 * Configura los headers de seguridad para protección XSS
 * @param {Object} res - Objeto de respuesta
 */
export function setSecurityHeaders(res) {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
}

/**
 * Verifica y sanitiza un input específico
 * @param {string} input - Input a verificar
 * @param {string} type - Tipo de input
 * @returns {string} Input sanitizado
 */
export function sanitizeInput(input, type) {
    if (typeof input !== 'string') {
        return input;
    }

    const sanitized = sanitizeString(input);

    switch (type) {
        case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
                throw new Error('Formato de email inválido');
            }
            break;
        case 'url':
            try {
                new URL(sanitized);
            } catch {
                throw new Error('URL inválida');
            }
            break;
        case 'number':
            if (isNaN(Number(sanitized))) {
                throw new Error('Valor numérico inválido');
            }
            break;
    }

    return sanitized;
} 