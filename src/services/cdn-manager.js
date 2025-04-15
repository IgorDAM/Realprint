class CDNManager {
    constructor() {
        this.cdnUrl = 'https://cdn.realprint.com';
        this.fallbackUrls = {
            'bootstrap': 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist',
            'fontawesome': 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0',
            'jquery': 'https://code.jquery.com'
        };
        this.setupCDN();
    }

    setupCDN() {
        // Precargar recursos críticos
        this.preloadCriticalResources();

        // Configurar fallbacks
        this.setupFallbacks();
    }

    async preloadCriticalResources() {
        const criticalResources = [
            '/css/style.css',
            '/js/main.js',
            '/img/RealPrint logo.png'
        ];

        for (const resource of criticalResources) {
            await this.precacheResource(resource);
        }
    }

    async precacheResource(path) {
        try {
            const cdnUrl = `${this.cdnUrl}${path}`;
            const response = await fetch(cdnUrl, { mode: 'no-cors' });
            
            if (!response.ok) {
                throw new Error(`Failed to load ${cdnUrl}`);
            }

            // Almacenar en caché local
            if (window.cacheManager) {
                window.cacheManager.set(path, response, {
                    expiration: Date.now() + 86400000, // 24 horas
                    priority: 'high'
                });
            }
        } catch (error) {
            console.error('Error precaching resource:', error);
            // Intentar con URL de fallback
            this.useFallback(path);
        }
    }

    useFallback(path) {
        const fallbackUrl = this.getFallbackUrl(path);
        if (fallbackUrl) {
            this.loadResource(fallbackUrl);
        }
    }

    getFallbackUrl(path) {
        for (const [key, url] of Object.entries(this.fallbackUrls)) {
            if (path.includes(key)) {
                return `${url}${path.split(key)[1]}`;
            }
        }
        return null;
    }

    loadResource(url) {
        const element = this.createElement(url);
        if (element) {
            document.head.appendChild(element);
        }
    }

    createElement(url) {
        const extension = url.split('.').pop().toLowerCase();
        
        switch (extension) {
            case 'css':
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = url;
                return link;
            
            case 'js':
                const script = document.createElement('script');
                script.src = url;
                script.async = true;
                return script;
            
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
                const img = document.createElement('img');
                img.src = url;
                return img;
            
            default:
                return null;
        }
    }

    setupFallbacks() {
        // Configurar fallbacks para recursos críticos
        Object.entries(this.fallbackUrls).forEach(([key, url]) => {
            this.setupResourceFallback(key, url);
        });
    }

    setupResourceFallback(key, fallbackUrl) {
        const elements = document.querySelectorAll(`[src*="${key}"], [href*="${key}"]`);
        elements.forEach(element => {
            const originalSrc = element.src || element.href;
            element.onerror = () => {
                const fallbackSrc = originalSrc.replace(this.cdnUrl, fallbackUrl);
                element.src = fallbackSrc;
                element.href = fallbackSrc;
            };
        });
    }

    getResourceUrl(path) {
        return `${this.cdnUrl}${path}`;
    }

    async checkCDNHealth() {
        try {
            const response = await fetch(`${this.cdnUrl}/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async switchToFallback() {
        const isHealthy = await this.checkCDNHealth();
        if (!isHealthy) {
            // Cambiar todos los recursos a URLs de fallback
            Object.entries(this.fallbackUrls).forEach(([key, url]) => {
                const elements = document.querySelectorAll(`[src*="${key}"], [href*="${key}"]`);
                elements.forEach(element => {
                    const originalSrc = element.src || element.href;
                    const fallbackSrc = originalSrc.replace(this.cdnUrl, url);
                    element.src = fallbackSrc;
                    element.href = fallbackSrc;
                });
            });
        }
    }
}

// Instancia global del gestor de CDN
const cdnManager = new CDNManager();

// Exportar el gestor de CDN
window.cdnManager = cdnManager; 