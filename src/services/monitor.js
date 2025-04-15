class Monitor {
    constructor() {
        this.metrics = {
            performance: {},
            errors: [],
            usage: {
                clicks: 0,
                keyPresses: 0,
                navigation: [],
                sessionDuration: 0
            }
        };
        this.setupMonitoring();
    }

    // Configurar monitoreo
    setupMonitoring() {
        this.setupPerformanceMonitoring();
        this.setupErrorMonitoring();
        this.setupUsageMonitoring();
        this.setupReporting();
    }

    // Monitorear rendimiento
    setupPerformanceMonitoring() {
        // Monitoreo de rendimiento
        if (window.PerformanceObserver) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.metrics.performance[entry.name] = entry.duration;
                }
            });

            observer.observe({ entryTypes: ['measure', 'resource'] });
        }

        // Medir tiempo de carga
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            this.metrics.performance.loadTime = loadTime;
        });
    }

    // Monitorear errores
    setupErrorMonitoring() {
        // Capturar errores no manejados
        window.addEventListener('error', (event) => {
            this.metrics.errors.push({
                type: 'unhandled',
                message: event.message,
                stack: event.error?.stack,
                timestamp: new Date().toISOString()
            });
        });

        // Capturar promesas rechazadas
        window.addEventListener('unhandledrejection', (event) => {
            this.metrics.errors.push({
                type: 'promise',
                message: event.reason?.message || 'Promise rejected',
                stack: event.reason?.stack,
                timestamp: new Date().toISOString()
            });
        });
    }

    // Monitorear uso
    setupUsageMonitoring() {
        // Monitorear interacciones del usuario
        document.addEventListener('click', () => {
            this.metrics.usage.clicks++;
        });

        document.addEventListener('keypress', () => {
            this.metrics.usage.keyPresses++;
        });

        // Monitorear navegación
        window.addEventListener('popstate', () => {
            this.metrics.usage.navigation.push({
                path: window.location.pathname,
                timestamp: new Date().toISOString()
            });
        });

        // Medir duración de la sesión
        this.startSessionTimer();
    }

    // Configurar reportes
    setupReporting() {
        // Enviar métricas cada 30 segundos
        setInterval(() => {
            this.sendMetrics();
        }, 30000);

        // Enviar métricas al cerrar la página
        window.addEventListener('beforeunload', () => {
            this.sendMetrics();
        });
    }

    // Iniciar temporizador de sesión
    startSessionTimer() {
        const startTime = Date.now();
        setInterval(() => {
            this.metrics.usage.sessionDuration = (Date.now() - startTime) / 1000;
        }, 1000);
    }

    // Enviar métricas
    async sendMetrics() {
        try {
            const response = await fetch('/api/metrics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.metrics)
            });

            if (response.ok) {
                // Limpiar métricas después de enviarlas
                this.metrics.errors = [];
                this.metrics.usage.clicks = 0;
                this.metrics.usage.keyPresses = 0;
            }
        } catch (error) {
            console.error('Error enviando métricas:', error);
        }
    }

    // Obtener métricas
    getMetrics() {
        return this.metrics;
    }

    // Limpiar métricas
    clearMetrics() {
        this.metrics = {
            performance: {},
            errors: [],
            usage: {}
        };
    }

    trackInteraction(type, data) {
        this.metrics.usage[type] = {
            ...data,
            timestamp: new Date().toISOString()
        };
    }

    trackNavigation(path) {
        this.metrics.usage.navigation.push({
            path,
            timestamp: new Date().toISOString()
        });
    }
}

// Instancia global del monitor
const monitor = new Monitor();

// Exportar el monitor
window.monitor = monitor; 