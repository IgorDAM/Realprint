// Cache para almacenar las variables de entorno
let envCache = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Variables críticas que deben estar presentes
const REQUIRED_ENV_VARS = [
    'GOOGLE_MAPS_API_KEY',
    'RECAPTCHA_SITE_KEY',
    'RECAPTCHA_SECRET_KEY',
    'JWT_SECRET',
    'SESSION_SECRET'
];

/**
 * Carga las variables de entorno desde el servidor
 * @returns {Promise<Object>} Objeto con las variables de entorno
 */
async function loadEnv() {
    try {
        // Verificar si hay caché válida
        const now = Date.now();
        if (envCache && (now - lastFetchTime) < CACHE_TTL) {
            return envCache;
        }

        const response = await fetch('/api/env');
        
        if (!response.ok) {
            throw new Error(`Error al cargar variables de entorno: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Validar variables críticas
        const missingVars = REQUIRED_ENV_VARS.filter(varName => !data[varName]);
        if (missingVars.length > 0) {
            throw new Error(`Variables de entorno críticas faltantes: ${missingVars.join(', ')}`);
        }

        // Actualizar caché
        envCache = data;
        lastFetchTime = now;
        
        return data;
    } catch (error) {
        console.error('Error al cargar variables de entorno:', error);
        throw error;
    }
}

/**
 * Obtiene el valor de una variable de entorno
 * @param {string} key - Nombre de la variable de entorno
 * @returns {Promise<string>} Valor de la variable de entorno
 */
export async function getEnv(key) {
    try {
        const env = await loadEnv();
        const value = env[key];
        
        if (value === undefined) {
            console.warn(`Variable de entorno no encontrada: ${key}`);
        }
        
        return value;
    } catch (error) {
        console.error(`Error al obtener variable de entorno ${key}:`, error);
        throw error;
    }
}

/**
 * Obtiene múltiples variables de entorno
 * @param {string[]} keys - Array de nombres de variables de entorno
 * @returns {Promise<Object>} Objeto con los valores de las variables
 */
export async function getMultipleEnv(keys) {
    try {
        const env = await loadEnv();
        return keys.reduce((acc, key) => {
            acc[key] = env[key];
            return acc;
        }, {});
    } catch (error) {
        console.error('Error al obtener múltiples variables de entorno:', error);
        throw error;
    }
}

/**
 * Verifica si todas las variables de entorno requeridas están presentes
 * @returns {Promise<boolean>} true si todas las variables están presentes
 */
export async function validateEnv() {
    try {
        const env = await loadEnv();
        return REQUIRED_ENV_VARS.every(key => env[key]);
    } catch (error) {
        console.error('Error al validar variables de entorno:', error);
        return false;
    }
}

// Cargar variables de entorno al iniciar
loadEnv().catch(error => {
    console.error('Error inicial al cargar variables de entorno:', error);
}); 