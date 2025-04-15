// Rate Limiter
class RateLimiter {
    constructor(limit, interval) {
        this.limit = limit;
        this.interval = interval;
        this.requests = new Map();
    }

    checkLimit(key) {
        const now = Date.now();
        const userRequests = this.requests.get(key) || [];

        // Eliminar solicitudes antiguas
        const validRequests = userRequests.filter(time => now - time < this.interval);
        
        if (validRequests.length >= this.limit) {
            return false;
        }

        validRequests.push(now);
        this.requests.set(key, validRequests);
        return true;
    }
}

// Validación de datos
class DataValidator {
    static validatePedido(pedido) {
        const errors = [];

        if (!pedido.id || typeof pedido.id !== 'number') {
            errors.push('ID de pedido inválido');
        }

        if (!pedido.fecha || isNaN(new Date(pedido.fecha).getTime())) {
            errors.push('Fecha inválida');
        }

        if (!pedido.estado || !['pendiente', 'en_proceso', 'completado', 'cancelado'].includes(pedido.estado)) {
            errors.push('Estado inválido');
        }

        if (typeof pedido.total !== 'number' || pedido.total < 0) {
            errors.push('Total inválido');
        }

        if (typeof pedido.progreso !== 'number' || pedido.progreso < 0 || pedido.progreso > 100) {
            errors.push('Progreso inválido');
        }

        return errors;
    }

    static validateEstadisticas(stats) {
        const errors = [];

        if (typeof stats.totalPedidos !== 'number' || stats.totalPedidos < 0) {
            errors.push('Total de pedidos inválido');
        }

        if (typeof stats.pedidosPendientes !== 'number' || stats.pedidosPendientes < 0) {
            errors.push('Pedidos pendientes inválidos');
        }

        if (typeof stats.gastoTotal !== 'number' || stats.gastoTotal < 0) {
            errors.push('Gasto total inválido');
        }

        if (!Array.isArray(stats.evolucionPedidos)) {
            errors.push('Evolución de pedidos inválida');
        }

        return errors;
    }
}

// Gestión de caché mejorada
class CacheManager {
    constructor(ttl = 5 * 60 * 1000) { // 5 minutos por defecto
        this.cache = new Map();
        this.ttl = ttl;
    }

    set(key, value, ttl = this.ttl) {
        this.cache.set(key, {
            data: value,
            timestamp: Date.now(),
            ttl: ttl
        });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    delete(key) {
        this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    // Invalidar caché basado en patrones
    invalidate(pattern) {
        for (const key of this.cache.keys()) {
            if (key.match(pattern)) {
                this.cache.delete(key);
            }
        }
    }
}

// Optimización de recursos
class ResourceOptimizer {
    static async optimizeImage(imageUrl, maxWidth = 800) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const ratio = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * ratio;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = reject;
            img.src = imageUrl;
        });
    }

    static compressData(data) {
        return JSON.stringify(data);
    }

    static decompressData(compressedData) {
        return JSON.parse(compressedData);
    }
}

// Exportar las clases
export const rateLimiter = new RateLimiter(100, 60000); // 100 solicitudes por minuto
export const cacheManager = new CacheManager();
export { DataValidator, ResourceOptimizer }; 