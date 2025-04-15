import { getEnv } from './env.js';
import { logger } from './logger.js';
import { generateEmailVerificationToken, verifyEmailToken } from './security.js';

/**
 * Envía un email de verificación
 * @param {string} email - Email del usuario
 * @param {string} token - Token de verificación
 * @returns {Promise<boolean>} true si el envío fue exitoso
 */
export async function sendVerificationEmail(email, token) {
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

        const verificationUrl = `${config.apiBaseUrl}/verify-email?token=${token}`;

        const mailOptions = {
            from: emailConfig.EMAIL_FROM,
            to: email,
            subject: 'Verifica tu email - RealPrint',
            html: `
                <h1>Verifica tu email</h1>
                <p>Hola,</p>
                <p>Gracias por registrarte en RealPrint. Por favor, verifica tu email haciendo clic en el siguiente enlace:</p>
                <p><a href="${verificationUrl}">${verificationUrl}</a></p>
                <p>Este enlace expirará en 24 horas.</p>
                <p>Si no solicitaste este registro, por favor ignora este email.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        logger.info('Email de verificación enviado', { email });
        return true;
    } catch (error) {
        logger.error('Error al enviar email de verificación', error);
        return false;
    }
}

/**
 * Inicializa el proceso de verificación de email
 * @param {string} email - Email del usuario
 * @returns {Promise<{token: string, timestamp: number}>} Información del token
 */
export async function initializeEmailVerification(email) {
    try {
        const token = generateEmailVerificationToken();
        const timestamp = Date.now();

        const sent = await sendVerificationEmail(email, token);
        if (!sent) {
            throw new Error('Error al enviar email de verificación');
        }

        return { token, timestamp };
    } catch (error) {
        logger.error('Error al inicializar verificación de email', error);
        throw error;
    }
}

/**
 * Verifica un token de email
 * @param {string} token - Token a verificar
 * @returns {boolean} true si el token es válido
 */
export function verifyEmailVerificationToken(token) {
    return verifyEmailToken(token);
}

/**
 * Middleware para verificar si el email está verificado
 * @returns {Function} Middleware
 */
export function requireEmailVerification() {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: 'No autorizado' });
                return;
            }

            if (!user.emailVerified) {
                res.status(403).json({ 
                    error: 'Email no verificado',
                    message: 'Por favor, verifica tu email antes de continuar'
                });
                return;
            }

            next();
        } catch (error) {
            logger.error('Error en verificación de email:', error);
            next(error);
        }
    };
}

/**
 * Reenvía el email de verificación
 * @param {string} email - Email del usuario
 * @returns {Promise<boolean>} true si el reenvío fue exitoso
 */
export async function resendVerificationEmail(email) {
    try {
        const { token, timestamp } = await initializeEmailVerification(email);
        
        // Almacenar el token temporalmente
        sessionStorage.setItem('verification_token', token);
        sessionStorage.setItem('verification_timestamp', timestamp.toString());
        
        return true;
    } catch (error) {
        logger.error('Error al reenviar email de verificación', error);
        return false;
    }
} 