import config from './config.js';

class Logger {
    constructor() {
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
        this.currentLevel = this.levels[config.logging.level];
    }

    log(level, message, data = null) {
        if (this.levels[level] >= this.currentLevel) {
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
            
            if (data) {
                console.log(logMessage, data);
            } else {
                console.log(logMessage);
            }

            // En producción, guardar en archivo
            if (config.logging.file) {
                this.writeToFile(logMessage, data);
            }
        }
    }

    async writeToFile(message, data) {
        try {
            const logEntry = data ? `${message} ${JSON.stringify(data)}\n` : `${message}\n`;
            const response = await fetch('/api/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: logEntry,
                    file: config.logging.file
                })
            });
            
            if (!response.ok) {
                console.error('Error al escribir en el archivo de log');
            }
        } catch (error) {
            console.error('Error en el sistema de logging:', error);
        }
    }

    debug(message, data = null) {
        this.log('debug', message, data);
    }

    info(message, data = null) {
        this.log('info', message, data);
    }

    warn(message, data = null) {
        this.log('warn', message, data);
    }

    error(message, data = null) {
        this.log('error', message, data);
    }
}

export const logger = new Logger(); 