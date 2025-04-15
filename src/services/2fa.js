import { getEnv } from './env.js';
import { logger } from './logger.js';
import { generateEmailVerificationToken } from './security.js';

/**
 * Genera un código de verificación de 6 dígitos
 * @returns {string} Código de verificación
 */
export function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Envía el código de verificación por email
 * @param {string} email - Email del usuario
 * @param {string} code - Código de verificación
 * @returns {Promise<boolean>} true si el envío fue exitoso
 */
export async function sendVerificationCode(email, code) {
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

        const mailOptions = {
            from: emailConfig.EMAIL_FROM,
            to: email,
            subject: 'Código de verificación - RealPrint',
            html: `
                <h1>Verificación de dos factores</h1>
                <p>Tu código de verificación es: <strong>${code}</strong></p>
                <p>Este código expirará en 10 minutos.</p>
                <p>Si no solicitaste este código, por favor ignora este email.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        logger.info('Código de verificación enviado', { email });
        return true;
    } catch (error) {
        logger.error('Error al enviar código de verificación', error);
        return false;
    }
}

/**
 * Verifica un código de verificación
 * @param {string} code - Código a verificar
 * @param {string} storedCode - Código almacenado
 * @param {number} timestamp - Timestamp de generación
 * @returns {boolean} true si el código es válido
 */
export function verifyCode(code, storedCode, timestamp) {
    const now = Date.now();
    const codeAge = now - timestamp;
    const codeExpiration = 10 * 60 * 1000; // 10 minutos

    return code === storedCode && codeAge <= codeExpiration;
}

/**
 * Genera y envía un código de verificación
 * @param {string} email - Email del usuario
 * @returns {Promise<{code: string, timestamp: number}>} Información del código
 */
export async function generateAndSendCode(email) {
    const code = generateVerificationCode();
    const timestamp = Date.now();

    const sent = await sendVerificationCode(email, code);
    if (!sent) {
        throw new Error('Error al enviar código de verificación');
    }

    return { code, timestamp };
}

/**
 * Inicializa la autenticación de dos factores
 * @param {string} email - Email del usuario
 * @returns {Promise<boolean>} true si la inicialización fue exitosa
 */
export async function initialize2FA(email) {
    try {
        const { code, timestamp } = await generateAndSendCode(email);
        
        // Almacenar el código temporalmente
        sessionStorage.setItem('2fa_code', code);
        sessionStorage.setItem('2fa_timestamp', timestamp.toString());
        
        return true;
    } catch (error) {
        logger.error('Error al inicializar 2FA', error);
        return false;
    }
}

/**
 * Verifica el código de autenticación de dos factores
 * @param {string} code - Código a verificar
 * @returns {boolean} true si la verificación fue exitosa
 */
export function verify2FACode(code) {
    const storedCode = sessionStorage.getItem('2fa_code');
    const timestamp = parseInt(sessionStorage.getItem('2fa_timestamp') || '0');

    if (!storedCode || !timestamp) {
        return false;
    }

    const isValid = verifyCode(code, storedCode, timestamp);

    if (isValid) {
        // Limpiar el código después de la verificación
        sessionStorage.removeItem('2fa_code');
        sessionStorage.removeItem('2fa_timestamp');
    }

    return isValid;
} 