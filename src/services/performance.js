class PerformanceManager {
    constructor() {
        this.observer = null;
        this.setupPerformanceMonitoring();
        this.setupLazyLoading();
        this.optimizeResources();
    }

    // Configurar monitoreo de rendimiento
    setupPerformanceMonitoring() {
        if ('performance' in window) {
            const timing = performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            console.log(`Tiempo de carga total: ${loadTime}ms`);

            // Monitorear métricas de rendimiento
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    console.log(`Métrica: ${entry.name}, Valor: ${entry.value}`);
                }
            });

            observer.observe({ entryTypes: ['measure', 'resource'] });
        }
    }

    // Configurar lazy loading
    setupLazyLoading() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    this.observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        // Observar imágenes con data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.observer.observe(img);
        });
    }

    // Optimizar recursos
    optimizeResources() {
        // Precargar recursos críticos
        this.preloadCriticalResources();

        // Optimizar imágenes
        this.optimizeImages();

        // Aplicar code splitting
        this.applyCodeSplitting();
    }

    // Precargar recursos críticos
    preloadCriticalResources() {
        const criticalResources = [
            '/css/style.min.css',
            '/js/main.js',
            '/img/logo.png'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 
                     resource.endsWith('.js') ? 'script' : 'image';
            document.head.appendChild(link);
        });
    }

    // Optimizar imágenes
    optimizeImages() {
        document.querySelectorAll('img').forEach(img => {
            // Añadir loading="lazy" a imágenes no críticas
            if (!img.classList.contains('critical')) {
                img.loading = 'lazy';
            }

            // Añadir srcset para imágenes responsivas
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
                img.sizes = img.dataset.sizes || '100vw';
            }
        });
    }

    // Aplicar code splitting
    applyCodeSplitting() {
        // Cargar módulos bajo demanda
        const loadModule = async (moduleName) => {
            try {
                const module = await import(`./modules/${moduleName}.js`);
                return module;
            } catch (error) {
                console.error(`Error cargando módulo ${moduleName}:`, error);
                return null;
            }
        };

        // Cargar módulos cuando sean necesarios
        document.querySelectorAll('[data-module]').forEach(element => {
            const moduleName = element.dataset.module;
            element.addEventListener('click', async () => {
                const module = await loadModule(moduleName);
                if (module) {
                    module.init(element);
                }
            });
        });
    }

    // Optimizar animaciones
    optimizeAnimations() {
        document.querySelectorAll('[data-animate]').forEach(element => {
            element.style.willChange = 'transform, opacity';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate');
                        observer.unobserve(entry.target);
                    }
                });
            });

            observer.observe(element);
        });
    }

    // Limpiar recursos
    cleanup() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// Estilos CSS para optimización de rendimiento
const style = document.createElement('style');
style.textContent = `
    img[loading="lazy"] {
        opacity: 0;
        transition: opacity 0.3s;
    }

    img[loading="lazy"].loaded {
        opacity: 1;
    }

    [data-animate] {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s, transform 0.5s;
    }

    [data-animate].animate {
        opacity: 1;
        transform: translateY(0);
    }

    .will-change {
        will-change: transform, opacity;
    }
`;
document.head.appendChild(style);

// Instancia global del gestor de rendimiento
const performanceManager = new PerformanceManager();

// Limpiar al cerrar la página
window.addEventListener('beforeunload', () => {
    performanceManager.cleanup();
});

// Exportar el gestor de rendimiento
window.performanceManager = performanceManager; 