import { getEnv } from './env.js';
import { logger } from './logger.js';

/**
 * Genera un token CSRF
 * @returns {Promise<string>} Token CSRF
 */
export async function generateCsrfToken() {
    try {
        const secret = await getEnv('CSRF_SECRET');
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        const token = `${timestamp}:${random}:${secret}`;
        return btoa(token);
    } catch (error) {
        logger.error('Error al generar token CSRF:', error);
        throw error;
    }
}

/**
 * Verifica un token CSRF
 * @param {string} token - Token a verificar
 * @returns {Promise<boolean>} true si el token es válido
 */
export async function verifyCsrfToken(token) {
    try {
        const secret = await getEnv('CSRF_SECRET');
        const decoded = atob(token);
        const [timestamp, , tokenSecret] = decoded.split(':');
        
        // Verificar que el token no sea muy antiguo (15 minutos)
        const age = Date.now() - parseInt(timestamp);
        if (age > 15 * 60 * 1000) {
            return false;
        }
        
        return tokenSecret === secret;
    } catch (error) {
        logger.error('Error al verificar token CSRF:', error);
        return false;
    }
}

/**
 * Verifica el reCAPTCHA
 * @param {string} response - Respuesta del reCAPTCHA
 * @returns {Promise<boolean>} true si la verificación es exitosa
 */
export async function verifyRecaptcha(response) {
    try {
        const secretKey = await getEnv('RECAPTCHA_SECRET_KEY');
        const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
        
        const formData = new FormData();
        formData.append('secret', secretKey);
        formData.append('response', response);
        
        const result = await fetch(verifyUrl, {
            method: 'POST',
            body: formData
        });
        
        const data = await result.json();
        return data.success;
    } catch (error) {
        logger.error('Error al verificar reCAPTCHA:', error);
        return false;
    }
}

/**
 * Verifica la fortaleza de una contraseña
 * @param {string} password - Contraseña a verificar
 * @returns {Object} Objeto con el resultado de la verificación
 */
export function checkPasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = {
        length: password.length >= minLength,
        upperCase: hasUpperCase,
        lowerCase: hasLowerCase,
        numbers: hasNumbers,
        specialChar: hasSpecialChar
    };
    
    const score = Object.values(strength).filter(Boolean).length;
    const isStrong = score >= 4 && password.length >= 12;
    
    return {
        ...strength,
        score,
        isStrong,
        meetsRequirements: Object.values(strength).every(Boolean)
    };
}

/**
 * Genera un token de verificación de email
 * @returns {string} Token de verificación
 */
export function generateEmailVerificationToken() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}:${random}`;
}

/**
 * Verifica un token de verificación de email
 * @param {string} token - Token a verificar
 * @returns {boolean} true si el token es válido
 */
export function verifyEmailToken(token) {
    try {
        const [timestamp] = token.split(':');
        const age = Date.now() - parseInt(timestamp);
        return age <= 24 * 60 * 60 * 1000; // 24 horas
    } catch (error) {
        logger.error('Error al verificar token de email:', error);
        return false;
    }
}

/**
 * Sanitiza una cadena de texto
 * @param {string} str - Cadena a sanitizar
 * @returns {string} Cadena sanitizada
 */
export function sanitizeString(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Verifica si una URL es segura
 * @param {string} url - URL a verificar
 * @returns {boolean} true si la URL es segura
 */
export function isSecureUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'https:';
    } catch (error) {
        return false;
    }
}

class SecurityManager {
    constructor() {
        this.csrfToken = this.generateCSRFToken();
        this.secureHeaders = {
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
            'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
        };
    }

    // Generar token CSRF
    generateCSRFToken() {
        const array = new Uint32Array(8);
        window.crypto.getRandomValues(array);
        return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
    }

    // Verificar y forzar HTTPS
    async enforceHTTPS() {
        if (window.location.protocol !== 'https:') {
            window.location.href = 'https://' + window.location.host + window.location.pathname;
            return false;
        }
        return true;
    }

    // Configurar headers de seguridad
    async setSecurityHeaders() {
        try {
            const response = await fetch('/api/security-headers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.secureHeaders)
            });
            
            if (!response.ok) {
                throw new Error('Error al configurar headers de seguridad');
            }
            
            return true;
        } catch (error) {
            console.error('Error en setSecurityHeaders:', error);
            return false;
        }
    }

    // Verificar certificado SSL
    async checkSSL() {
        try {
            const response = await fetch('https://' + window.location.host, {
                method: 'HEAD'
            });
            
            if (!response.ok) {
                throw new Error('Error en la conexión HTTPS');
            }
            
            return true;
        } catch (error) {
            console.error('Error en checkSSL:', error);
            return false;
        }
    }

    // Sanitizar input
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Validar email
    validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }

    // Validar contraseña
    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return password.length >= minLength && 
               hasUpperCase && 
               hasLowerCase && 
               hasNumbers && 
               hasSpecialChar;
    }

    // Validar teléfono
    validatePhone(phone) {
        const re = /^[0-9]{9}$/;
        return re.test(phone);
    }

    // Encriptar datos sensibles
    async encryptData(data) {
        const encoder = new TextEncoder();
        const key = await window.crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encoder.encode(data)
        );
        return {
            encrypted,
            iv,
            key
        };
    }

    // Validar formulario
    validateForm(formData) {
        const errors = {};
        
        if (formData.email && !this.validateEmail(formData.email)) {
            errors.email = 'Email inválido';
        }
        
        if (formData.password && !this.validatePassword(formData.password)) {
            errors.password = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial';
        }
        
        if (formData.phone && !this.validatePhone(formData.phone)) {
            errors.phone = 'Teléfono inválido';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Añadir token CSRF a peticiones
    addCSRFToken(headers = {}) {
        return {
            ...headers,
            'X-CSRF-Token': this.csrfToken
        };
    }
}

// Inicializar seguridad
const securityManager = new SecurityManager();
document.addEventListener('DOMContentLoaded', async () => {
    await securityManager.enforceHTTPS();
    await securityManager.setSecurityHeaders();
    await securityManager.checkSSL();
});

// Exportar el gestor de seguridad
window.securityManager = securityManager; 