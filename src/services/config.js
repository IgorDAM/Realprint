const env = process.env.NODE_ENV || 'development';

const config = {
    development: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg',
        apiBaseUrl: 'http://localhost:3000/api',
        allowedOrigins: ['http://localhost:3000'],
        sessionTimeout: 30 * 60 * 1000, // 30 minutos
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
        recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
        emailVerification: true,
        logging: {
            level: 'debug',
            file: 'logs/development.log'
        }
    },
    production: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
        apiBaseUrl: 'https://api.realprint.es/api',
        allowedOrigins: ['https://realprint.es'],
        sessionTimeout: 60 * 60 * 1000, // 1 hora
        maxFileSize: 20 * 1024 * 1024, // 20MB
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
        recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
        emailVerification: true,
        logging: {
            level: 'error',
            file: 'logs/production.log'
        }
    }
};

export default config[env]; 