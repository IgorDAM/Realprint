const nodemailer = require('nodemailer');
const { Pool } = require('mysql2/promise');
const winston = require('winston');

// Configuración del logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/notifications.log' })
    ]
});

// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

class NotificationSystem {
    constructor(pool) {
        this.pool = pool;
        this.notificationTypes = {
            PEDIDO_CREADO: 'pedido_creado',
            PEDIDO_ACTUALIZADO: 'pedido_actualizado',
            PEDIDO_COMPLETADO: 'pedido_completado',
            INCIDENCIA_REPORTADA: 'incidencia_reportada',
            MANTENIMIENTO_PROGRAMADO: 'mantenimiento_programado',
            FACTURA_GENERADA: 'factura_generada',
            PAGO_RECIBIDO: 'pago_recibido'
        };
    }

    // Enviar notificación por correo
    async sendEmailNotification(to, subject, html) {
        try {
            await transporter.sendMail({
                from: process.env.SMTP_FROM,
                to,
                subject,
                html
            });
            logger.info('Notificación por correo enviada', { to, subject });
        } catch (error) {
            logger.error('Error al enviar notificación por correo', { error: error.message });
            throw error;
        }
    }

    // Guardar notificación en la base de datos
    async saveNotification(userId, type, title, message, data = {}) {
        try {
            await this.pool.query(
                'INSERT INTO tnotificaciones (id_usuario, tipo, titulo, mensaje, datos, fecha) VALUES (?, ?, ?, ?, ?, NOW())',
                [userId, type, title, message, JSON.stringify(data)]
            );
            logger.info('Notificación guardada en base de datos', { userId, type });
        } catch (error) {
            logger.error('Error al guardar notificación', { error: error.message });
            throw error;
        }
    }

    // Obtener notificaciones de un usuario
    async getUserNotifications(userId, limit = 10) {
        try {
            const [notifications] = await this.pool.query(
                'SELECT * FROM tnotificaciones WHERE id_usuario = ? ORDER BY fecha DESC LIMIT ?',
                [userId, limit]
            );
            return notifications;
        } catch (error) {
            logger.error('Error al obtener notificaciones', { error: error.message });
            throw error;
        }
    }

    // Marcar notificación como leída
    async markAsRead(notificationId) {
        try {
            await this.pool.query(
                'UPDATE tnotificaciones SET leida = 1 WHERE id_notificacion = ?',
                [notificationId]
            );
            logger.info('Notificación marcada como leída', { notificationId });
        } catch (error) {
            logger.error('Error al marcar notificación como leída', { error: error.message });
            throw error;
        }
    }

    // Notificar creación de pedido
    async notifyPedidoCreado(pedido) {
        const subject = 'Nuevo Pedido Creado';
        const html = `
            <h2>Nuevo Pedido Creado</h2>
            <p>Se ha creado un nuevo pedido con ID: ${pedido.id_pedido}</p>
            <p>Descripción: ${pedido.descripcion}</p>
            <p>Fecha de entrega: ${pedido.fecha_entrega}</p>
        `;

        await this.sendEmailNotification(pedido.email_cliente, subject, html);
        await this.saveNotification(
            pedido.id_cliente,
            this.notificationTypes.PEDIDO_CREADO,
            'Nuevo Pedido',
            'Se ha creado un nuevo pedido',
            pedido
        );
    }

    // Notificar actualización de pedido
    async notifyPedidoActualizado(pedido) {
        const subject = 'Pedido Actualizado';
        const html = `
            <h2>Pedido Actualizado</h2>
            <p>El pedido ${pedido.id_pedido} ha sido actualizado</p>
            <p>Nuevo estado: ${pedido.estado}</p>
            <p>Observaciones: ${pedido.observaciones || 'Ninguna'}</p>
        `;

        await this.sendEmailNotification(pedido.email_cliente, subject, html);
        await this.saveNotification(
            pedido.id_cliente,
            this.notificationTypes.PEDIDO_ACTUALIZADO,
            'Pedido Actualizado',
            'El estado de tu pedido ha sido actualizado',
            pedido
        );
    }

    // Notificar incidencia
    async notifyIncidencia(incidencia) {
        const subject = 'Nueva Incidencia Reportada';
        const html = `
            <h2>Nueva Incidencia</h2>
            <p>Tipo: ${incidencia.tipo}</p>
            <p>Descripción: ${incidencia.descripcion}</p>
            <p>Gravedad: ${incidencia.gravedad}</p>
        `;

        // Notificar al jefe de producción
        await this.sendEmailNotification(process.env.JEFE_PRODUCCION_EMAIL, subject, html);
        await this.saveNotification(
            incidencia.id_usuario_reporta,
            this.notificationTypes.INCIDENCIA_REPORTADA,
            'Incidencia Reportada',
            'Se ha reportado una nueva incidencia',
            incidencia
        );
    }
}

module.exports = NotificationSystem; 