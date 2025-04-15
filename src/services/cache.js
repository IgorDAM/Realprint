class CacheManager {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100; // Máximo número de entradas en caché
        this.setupCache();
    }

    // Configurar caché
    setupCache() {
        // Limpiar caché expirado cada hora
        setInterval(() => {
            this.cleanExpiredCache();
        }, 3600000);

        // Precargar recursos críticos
        this.preloadCriticalResources();
    }

    // Precargar recursos críticos
    async preloadCriticalResources() {
        const criticalResources = [
            '/css/style.css',
            '/js/main.js',
            '/img/RealPrint logo.png',
            '/api/services'
        ];

        for (const resource of criticalResources) {
            await this.precache(resource);
        }
    }

    // Precargar recurso
    async precache(url, options = {}) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                this.set(url, data, {
                    expiration: Date.now() + 86400000, // 24 horas
                    priority: 'high',
                    ...options
                });
            }
        } catch (error) {
            console.error('Error precaching resource:', error);
        }
    }

    // Establecer entrada en caché
    set(key, value, options = {}) {
        const entry = {
            value,
            timestamp: Date.now(),
            expiration: options.expiration || Date.now() + 3600000, // 1 hora por defecto
            priority: options.priority || 'normal',
            tags: options.tags || []
        };

        // Limpiar caché si está lleno
        if (this.cache.size >= this.maxSize) {
            this.cleanOldestEntries();
        }

        this.cache.set(key, entry);
    }

    // Obtener entrada de caché
    get(key) {
        const entry = this.cache.get(key);
        
        if (!entry) {
            return null;
        }

        // Verificar si ha expirado
        if (entry.expiration < Date.now()) {
            this.cache.delete(key);
            return null;
        }

        // Actualizar timestamp de acceso
        entry.timestamp = Date.now();
        return entry.value;
    }

    // Eliminar entrada de caché
    delete(key) {
        return this.cache.delete(key);
    }

    // Limpiar caché expirado
    cleanExpiredCache() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (entry.expiration < now) {
                this.cache.delete(key);
            }
        }
    }

    // Limpiar entradas más antiguas
    cleanOldestEntries() {
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => {
            // Priorizar entradas de alta prioridad
            if (a[1].priority === 'high' && b[1].priority !== 'high') return -1;
            if (a[1].priority !== 'high' && b[1].priority === 'high') return 1;
            // Ordenar por timestamp
            return a[1].timestamp - b[1].timestamp;
        });

        // Eliminar las entradas más antiguas hasta que haya espacio
        while (this.cache.size >= this.maxSize) {
            const [key] = entries.shift();
            this.cache.delete(key);
        }
    }

    // Limpiar caché por etiqueta
    clearByTag(tag) {
        for (const [key, entry] of this.cache.entries()) {
            if (entry.tags.includes(tag)) {
                this.cache.delete(key);
            }
        }
    }

    // Limpiar todo el caché
    clear() {
        this.cache.clear();
    }

    // Obtener estadísticas del caché
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
                key,
                age: Date.now() - entry.timestamp,
                expiration: entry.expiration,
                priority: entry.priority,
                tags: entry.tags
            }))
        };
    }

    // Configurar tamaño máximo
    setMaxSize(size) {
        this.maxSize = size;
        if (this.cache.size > size) {
            this.cleanOldestEntries();
        }
    }
}

// Instancia global del gestor de caché
const cacheManager = new CacheManager();

// Exportar el gestor de caché
window.cacheManager = cacheManager; 