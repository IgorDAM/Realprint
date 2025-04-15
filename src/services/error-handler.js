class ErrorHandler {
    constructor() {
        this.errors = [];
        this.setupErrorHandling();
    }

    // Configurar manejo de errores
    setupErrorHandling() {
        // Capturar errores no manejados
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'unhandled',
                message: event.message,
                stack: event.error?.stack,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                timestamp: new Date().toISOString()
            });
        });

        // Capturar promesas rechazadas
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'promise',
                message: event.reason?.message || 'Promise rejected',
                stack: event.reason?.stack,
                timestamp: new Date().toISOString()
            });
        });

        // Capturar errores de recursos
        window.addEventListener('error', (event) => {
            if (event.target.tagName === 'IMG' || 
                event.target.tagName === 'SCRIPT' || 
                event.target.tagName === 'LINK') {
                this.handleError({
                    type: 'resource',
                    message: `Error loading ${event.target.tagName.toLowerCase()}`,
                    url: event.target.src || event.target.href
                });
            }
        }, true);
    }

    // Manejar error
    handleError(error) {
        // Añadir información adicional
        const enhancedError = {
            ...error,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            path: window.location.pathname
        };

        // Añadir a la lista de errores
        this.errors.push(enhancedError);

        // Registrar error
        this.logError(enhancedError);

        // Notificar error
        this.notifyError(enhancedError);

        // Enviar error al servidor
        this.sendError(enhancedError);
    }

    // Registrar error
    logError(error) {
        console.error('Error:', error);
        
        // Registrar en el sistema de monitoreo
        if (window.monitor) {
            window.monitor.metrics.errors.push(error);
        }
    }

    // Notificar error
    notifyError(error) {
        // Mostrar notificación al usuario
        if (window.feedbackManager) {
            let message = 'Ha ocurrido un error';
            
            if (error.type === 'resource') {
                message = 'Error al cargar un recurso';
            } else if (error.type === 'promise') {
                message = 'Error en una operación';
            }

            window.feedbackManager.error(message);
        }
    }

    // Enviar error al servidor
    async sendError(error) {
        try {
            const response = await fetch('/api/errors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...securityManager.addCSRFToken()
                },
                body: JSON.stringify(error)
            });

            if (response.ok) {
                // Error enviado correctamente
                console.log('Error enviado al servidor');
            }
        } catch (sendError) {
            console.error('Error enviando error al servidor:', sendError);
        }
    }

    // Obtener errores
    getErrors() {
        return this.errors;
    }

    // Limpiar errores
    clearErrors() {
        this.errors = [];
    }

    // Manejar error específico
    handleSpecificError(type, message, details = {}) {
        this.handleError({
            type,
            message,
            ...details
        });
    }

    // Crear error personalizado
    createCustomError(type, message, details = {}) {
        return {
            type,
            message,
            ...details,
            timestamp: new Date().toISOString()
        };
    }

    // Verificar si hay errores
    hasErrors() {
        return this.errors.length > 0;
    }

    // Obtener último error
    getLastError() {
        return this.errors[this.errors.length - 1];
    }

    // Filtrar errores por tipo
    filterErrorsByType(type) {
        return this.errors.filter(error => error.type === type);
    }

    // Limpiar errores por tipo
    clearErrorsByType(type) {
        this.errors = this.errors.filter(error => error.type !== type);
    }
}

// Instancia global del manejador de errores
const errorHandler = new ErrorHandler();

// Exportar el manejador de errores
window.errorHandler = errorHandler; 