import { getEnv } from './env.js';
import { logger } from './logger.js';
import { generateEmailVerificationToken, verifyEmailToken, checkPasswordStrength } from './security.js';

/**
 * Envía un email de recuperación de contraseña
 * @param {string} email - Email del usuario
 * @param {string} token - Token de recuperación
 * @returns {Promise<boolean>} true si el envío fue exitoso
 */
export async function sendPasswordRecoveryEmail(email, token) {
    try {
        const emailConfig = await getMultipleEnv([
            'EMAIL_HOST',
            'EMAIL_PORT',
            'EMAIL_USER',
            'EMAIL_PASSWORD',
            'EMAIL_FROM'
        ]);

        const transporter = nodemailer.createTransport({
            host: emailConfig.EMAIL_HOST,
            port: emailConfig.EMAIL_PORT,
            secure: emailConfig.EMAIL_PORT === 465,
            auth: {
                user: emailConfig.EMAIL_USER,
                pass: emailConfig.EMAIL_PASSWORD
            }
        });

        const recoveryUrl = `${config.apiBaseUrl}/reset-password?token=${token}`;

        const mailOptions = {
            from: emailConfig.EMAIL_FROM,
            to: email,
            subject: 'Recuperación de contraseña - RealPrint',
            html: `
                <h1>Recuperación de contraseña</h1>
                <p>Hola,</p>
                <p>Hemos recibido una solicitud para restablecer tu contraseña. Si no solicitaste este cambio, puedes ignorar este email.</p>
                <p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
                <p><a href="${recoveryUrl}">${recoveryUrl}</a></p>
                <p>Este enlace expirará en 1 hora.</p>
                <p>Si no solicitaste este cambio, por favor contacta con soporte.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        logger.info('Email de recuperación enviado', { email });
        return true;
    } catch (error) {
        logger.error('Error al enviar email de recuperación', error);
        return false;
    }
}

/**
 * Inicializa el proceso de recuperación de contraseña
 * @param {string} email - Email del usuario
 * @returns {Promise<{token: string, timestamp: number}>} Información del token
 */
export async function initializePasswordRecovery(email) {
    try {
        const token = generateEmailVerificationToken();
        const timestamp = Date.now();

        const sent = await sendPasswordRecoveryEmail(email, token);
        if (!sent) {
            throw new Error('Error al enviar email de recuperación');
        }

        return { token, timestamp };
    } catch (error) {
        logger.error('Error al inicializar recuperación de contraseña', error);
        throw error;
    }
}

/**
 * Verifica un token de recuperación
 * @param {string} token - Token a verificar
 * @returns {boolean} true si el token es válido
 */
export function verifyRecoveryToken(token) {
    return verifyEmailToken(token);
}

/**
 * Verifica la fortaleza de una nueva contraseña
 * @param {string} password - Nueva contraseña
 * @returns {boolean} true si la contraseña es válida
 */
export function validateNewPassword(password) {
    const strength = checkPasswordStrength(password);
    return strength.meetsRequirements;
}

/**
 * Middleware para verificar el token de recuperación
 * @returns {Function} Middleware
 */
export function verifyRecoveryTokenMiddleware() {
    return async (req, res, next) => {
        try {
            const { token } = req.query;
            if (!token) {
                res.status(400).json({ error: 'Token no proporcionado' });
                return;
            }

            const isValid = verifyRecoveryToken(token);
            if (!isValid) {
                res.status(400).json({ error: 'Token inválido o expirado' });
                return;
            }

            next();
        } catch (error) {
            logger.error('Error en verificación de token de recuperación:', error);
            next(error);
        }
    };
}

/**
 * Procesa la solicitud de recuperación de contraseña
 * @param {string} email - Email del usuario
 * @returns {Promise<boolean>} true si la solicitud fue procesada correctamente
 */
export async function processPasswordRecovery(email) {
    try {
        const { token, timestamp } = await initializePasswordRecovery(email);
        
        // Almacenar el token temporalmente
        sessionStorage.setItem('recovery_token', token);
        sessionStorage.setItem('recovery_timestamp', timestamp.toString());
        
        return true;
    } catch (error) {
        logger.error('Error al procesar recuperación de contraseña', error);
        return false;
    }
}

/**
 * Restablece la contraseña del usuario
 * @param {string} token - Token de recuperación
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<boolean>} true si la contraseña fue restablecida correctamente
 */
export async function resetPassword(token, newPassword) {
    try {
        // Verificar token
        const isValid = verifyRecoveryToken(token);
        if (!isValid) {
            throw new Error('Token inválido o expirado');
        }

        // Verificar fortaleza de la contraseña
        const isStrong = validateNewPassword(newPassword);
        if (!isStrong) {
            throw new Error('La contraseña no cumple con los requisitos de seguridad');
        }

        // Aquí iría la lógica para actualizar la contraseña en la base de datos
        // ...

        // Limpiar el token
        sessionStorage.removeItem('recovery_token');
        sessionStorage.removeItem('recovery_timestamp');

        return true;
    } catch (error) {
        logger.error('Error al restablecer contraseña', error);
        throw error;
    }
} 