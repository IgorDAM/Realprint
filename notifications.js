const { logInfo, logError } = require('./logger');
const nodemailer = require('nodemailer');

class NotificationManager {
    constructor() {
        this.notifications = new Map();
        this.subscribers = new Map();
        this.templates = {
            order: {
                title: 'Nuevo pedido',
                message: 'Has recibido un nuevo pedido de {customer}',
                icon: 'shopping-cart'
            },
            status: {
                title: 'Actualización de estado',
                message: 'El estado de tu pedido ha cambiado a {status}',
                icon: 'info-circle'
            },
            error: {
                title: 'Error',
                message: 'Ha ocurrido un error: {message}',
                icon: 'exclamation-triangle'
            },
            success: {
                title: 'Éxito',
                message: 'Operación completada con éxito',
                icon: 'check-circle'
            }
        };

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    // Enviar notificación
    async sendNotification(type, data) {
        try {
            const template = this.templates[type];
            if (!template) {
                throw new Error(`Template no encontrado para el tipo: ${type}`);
            }

            const notification = {
                id: this.generateId(),
                type,
                title: this.formatMessage(template.title, data),
                message: this.formatMessage(template.message, data),
                icon: template.icon,
                timestamp: new Date(),
                read: false,
                data
            };

            this.notifications.set(notification.id, notification);
            await this.notifySubscribers(notification);
            
            logInfo('Notificación enviada', notification);
            return notification;
        } catch (error) {
            logError('Error enviando notificación', { error, type, data });
            throw error;
        }
    }

    // Formatear mensaje con datos
    formatMessage(message, data) {
        return message.replace(/\{(\w+)\}/g, (match, key) => {
            return data[key] || match;
        });
    }

    // Generar ID único
    generateId() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    // Notificar a suscriptores
    async notifySubscribers(notification) {
        const subscribers = this.subscribers.get(notification.type) || [];
        
        for (const subscriber of subscribers) {
            try {
                await subscriber(notification);
            } catch (error) {
                logError('Error notificando a suscriptor', { error, subscriber, notification });
            }
        }
    }

    // Suscribir a notificaciones
    subscribe(type, callback) {
        if (!this.subscribers.has(type)) {
            this.subscribers.set(type, []);
        }
        this.subscribers.get(type).push(callback);
    }

    // Marcar notificación como leída
    markAsRead(id) {
        const notification = this.notifications.get(id);
        if (notification) {
            notification.read = true;
            this.notifications.set(id, notification);
        }
    }

    // Obtener notificaciones
    getNotifications(options = {}) {
        let notifications = Array.from(this.notifications.values());
        
        if (options.unreadOnly) {
            notifications = notifications.filter(n => !n.read);
        }
        
        if (options.type) {
            notifications = notifications.filter(n => n.type === options.type);
        }
        
        return notifications.sort((a, b) => b.timestamp - a.timestamp);
    }

    // Limpiar notificaciones antiguas
    cleanOldNotifications(days = 30) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        
        for (const [id, notification] of this.notifications.entries()) {
            if (notification.timestamp < cutoff) {
                this.notifications.delete(id);
            }
        }
    }

    // Enviar notificación de pedido
    async sendOrderNotification(order) {
        return this.sendNotification('order', {
            customer: order.customerName,
            orderId: order.id,
            amount: order.total
        });
    }

    // Enviar notificación de estado
    async sendStatusNotification(orderId, status) {
        return this.sendNotification('status', {
            orderId,
            status
        });
    }

    // Enviar notificación de error
    async sendErrorNotification(error) {
        return this.sendNotification('error', {
            message: error.message
        });
    }

    // Enviar notificación de éxito
    async sendSuccessNotification() {
        return this.sendNotification('success', {});
    }

    // Enviar email
    async sendEmail(to, subject, text, html = null) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to,
                subject,
                text,
                html
            };

            const info = await this.transporter.sendMail(mailOptions);
            logInfo('Email sent successfully', { to, subject });
            return info;
        } catch (error) {
            logError(error);
            throw error;
        }
    }

    // Enviar notificación de nuevo pedido
    async sendNewOrderNotification(order) {
        const subject = 'Nuevo pedido recibido';
        const text = `Se ha recibido un nuevo pedido con ID: ${order.id}`;
        const html = `
            <h1>Nuevo pedido recibido</h1>
            <p>ID del pedido: ${order.id}</p>
            <p>Cliente: ${order.cliente}</p>
            <p>Fecha: ${order.fecha}</p>
            <p>Total: ${order.total}€</p>
        `;

        return this.sendEmail(process.env.ADMIN_EMAIL, subject, text, html);
    }

    // Enviar notificación de cambio de estado
    async sendStatusChangeNotification(order) {
        const subject = 'Cambio de estado en tu pedido';
        const text = `El estado de tu pedido ${order.id} ha cambiado a: ${order.estado}`;
        const html = `
            <h1>Cambio de estado en tu pedido</h1>
            <p>ID del pedido: ${order.id}</p>
            <p>Nuevo estado: ${order.estado}</p>
            <p>Fecha: ${new Date().toLocaleDateString()}</p>
        `;

        return this.sendEmail(order.email, subject, text, html);
    }

    // Enviar notificación de backup
    async sendBackupNotification(backupFile) {
        const subject = 'Backup completado';
        const text = `Se ha completado el backup: ${backupFile}`;
        const html = `
            <h1>Backup completado</h1>
            <p>Archivo: ${backupFile}</p>
            <p>Fecha: ${new Date().toLocaleDateString()}</p>
        `;

        return this.sendEmail(process.env.ADMIN_EMAIL, subject, text, html);
    }
}

module.exports = new NotificationManager(); 