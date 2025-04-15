import { BackupData, BackupConfig, ErrorData, Metrics } from './types';

class BackupManager {
    private backupInterval: number;
    private maxBackups: number;
    private backupTimer: number | null;
    private config: BackupConfig;

    constructor(config?: Partial<BackupConfig>) {
        this.config = {
            interval: 3600000, // 1 hora
            maxBackups: 24, // 24 backups (1 día)
            compression: true,
            encryption: true,
            storage: 'remote',
            ...config
        };
        this.backupInterval = this.config.interval;
        this.maxBackups = this.config.maxBackups;
        this.backupTimer = null;
        this.setupBackup();
    }

    private setupBackup(): void {
        // Realizar backup inicial
        this.performBackup();

        // Configurar intervalo de backup
        this.backupTimer = window.setInterval(() => {
            this.performBackup();
        }, this.backupInterval);

        // Limpiar intervalo cuando se cierre la página
        window.addEventListener('beforeunload', () => {
            if (this.backupTimer) {
                clearInterval(this.backupTimer);
            }
        });
    }

    private async performBackup(): Promise<void> {
        try {
            // Obtener datos a respaldar
            const data = await this.collectData();

            // Comprimir datos
            const compressedData = await this.compressData(data);

            // Enviar al servidor
            await this.sendToServer(compressedData);

            // Limpiar backups antiguos
            await this.cleanOldBackups();

            console.log('Backup realizado con éxito');
        } catch (error) {
            console.error('Error en el backup:', error);
            this.handleBackupError(error);
        }
    }

    private async collectData(): Promise<BackupData> {
        const data: BackupData = {
            timestamp: new Date().toISOString(),
            userData: await this.getUserData(),
            settings: await this.getSettings(),
            cache: await this.getCacheData(),
            errors: await this.getErrorLogs(),
            metrics: await this.getMetrics()
        };

        return data;
    }

    private async getUserData(): Promise<Array<{ key: string; data: string }>> {
        const users: Array<{ key: string; data: string }> = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('user_')) {
                try {
                    const value = localStorage.getItem(key);
                    if (value) {
                        users.push({
                            key,
                            data: value
                        });
                    }
                } catch (error) {
                    console.error(`Error obteniendo datos de usuario ${key}:`, error);
                }
            }
        }
        return users;
    }

    private async getSettings(): Promise<Record<string, string>> {
        const settings: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('settings_')) {
                try {
                    const value = localStorage.getItem(key);
                    if (value) {
                        settings[key] = value;
                    }
                } catch (error) {
                    console.error(`Error obteniendo configuración ${key}:`, error);
                }
            }
        }
        return settings;
    }

    private async getCacheData(): Promise<any> {
        if (window.cacheManager) {
            try {
                return await window.cacheManager.getStats();
            } catch (error) {
                console.error('Error obteniendo datos de caché:', error);
                return null;
            }
        }
        return null;
    }

    private async getErrorLogs(): Promise<ErrorData[]> {
        if (window.errorHandler) {
            try {
                return await window.errorHandler.getErrors();
            } catch (error) {
                console.error('Error obteniendo logs de errores:', error);
                return [];
            }
        }
        return [];
    }

    private async getMetrics(): Promise<Metrics | null> {
        if (window.monitor) {
            try {
                return await window.monitor.getMetrics();
            } catch (error) {
                console.error('Error obteniendo métricas:', error);
                return null;
            }
        }
        return null;
    }

    private async compressData(data: BackupData): Promise<Uint8Array> {
        try {
            const jsonString = JSON.stringify(data);
            const encoder = new TextEncoder();
            return encoder.encode(jsonString);
        } catch (error) {
            console.error('Error comprimiendo datos:', error);
            throw new Error('Error al comprimir datos para el backup');
        }
    }

    private async sendToServer(data: Uint8Array): Promise<any> {
        try {
            const response = await fetch('/api/backup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream'
                },
                body: data
            });

            if (!response.ok) {
                throw new Error(`Error al enviar backup al servidor: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error en el envío del backup: ${error.message}`);
            }
            throw new Error('Error desconocido en el envío del backup');
        }
    }

    private async cleanOldBackups(): Promise<void> {
        try {
            const response = await fetch('/api/backup/clean', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    maxBackups: this.maxBackups
                })
            });

            if (!response.ok) {
                throw new Error(`Error al limpiar backups antiguos: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error limpiando backups:', error);
        }
    }

    private handleBackupError(error: unknown): void {
        this.notifyUser(error);

        if (window.monitor) {
            window.monitor.trackError({
                type: 'backup',
                message: error instanceof Error ? error.message : 'Error desconocido',
                timestamp: new Date().toISOString()
            });
        }

        this.tryAlternativeBackup();
    }

    private notifyUser(error: unknown): void {
        const notification = document.createElement('div');
        notification.className = 'backup-notification';
        notification.innerHTML = `
            <div class="alert alert-warning" role="alert">
                <h4 class="alert-heading">Error en el backup</h4>
                <p>${error instanceof Error ? error.message : 'Error desconocido'}</p>
                <hr>
                <p class="mb-0">Se intentará realizar el backup nuevamente en breve.</p>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    private tryAlternativeBackup(): void {
        setTimeout(async () => {
            try {
                await this.performBackup();
            } catch (error) {
                console.error('Error en backup alternativo:', error);
            }
        }, 300000);
    }

    public setBackupInterval(interval: number): void {
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
        }
        this.backupInterval = interval;
        this.backupTimer = window.setInterval(() => {
            this.performBackup();
        }, this.backupInterval);
    }

    public setMaxBackups(max: number): void {
        this.maxBackups = max;
    }

    public destroy(): void {
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
        }
        window.removeEventListener('beforeunload', this.destroy);
    }
}

// Inicializar gestor de backups
const backupManager = new BackupManager();

// Exportar el gestor de backups
export default backupManager; 