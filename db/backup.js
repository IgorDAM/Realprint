const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Configuración del logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/backup-error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/backup.log' })
    ]
});

// Configuración de backup
const backupConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    backupDir: path.join(__dirname, 'backups'),
    retentionDays: 7
};

// Crear directorio de backups si no existe
if (!fs.existsSync(backupConfig.backupDir)) {
    fs.mkdirSync(backupConfig.backupDir, { recursive: true });
}

// Función para realizar backup
function performBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupConfig.backupDir, `backup-${timestamp}.sql`);

    const command = `mysqldump -h ${backupConfig.host} -u ${backupConfig.user} -p${backupConfig.password} ${backupConfig.database} > ${backupFile}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            logger.error('Error en el backup:', { error, stderr });
            return;
        }

        logger.info('Backup completado exitosamente', { backupFile });
        cleanupOldBackups();
    });
}

// Función para limpiar backups antiguos
function cleanupOldBackups() {
    const files = fs.readdirSync(backupConfig.backupDir);
    const now = new Date();

    files.forEach(file => {
        const filePath = path.join(backupConfig.backupDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = (now - stats.mtime) / (1000 * 60 * 60 * 24);

        if (fileAge > backupConfig.retentionDays) {
            fs.unlinkSync(filePath);
            logger.info('Backup antiguo eliminado', { file });
        }
    });
}

// Programar backup diario a las 2 AM
const scheduleBackup = () => {
    const now = new Date();
    const nextBackup = new Date(now);
    nextBackup.setHours(2, 0, 0, 0);
    if (nextBackup < now) {
        nextBackup.setDate(nextBackup.getDate() + 1);
    }

    const timeUntilNextBackup = nextBackup - now;
    setTimeout(() => {
        performBackup();
        setInterval(performBackup, 24 * 60 * 60 * 1000);
    }, timeUntilNextBackup);
};

// Iniciar el proceso de backup
scheduleBackup();

module.exports = {
    performBackup,
    cleanupOldBackups
}; 