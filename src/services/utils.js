import config from './config.js';
import { logger } from './logger.js';

export const validators = {
    email: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    password: (password) => {
        return password.length >= 8 && 
               /[A-Z]/.test(password) && 
               /[a-z]/.test(password) && 
               /[0-9]/.test(password);
    },
    
    phone: (phone) => {
        const re = /^[0-9]{9}$/;
        return re.test(phone);
    },
    
    file: (file) => {
        if (!file) return false;
        if (file.size > config.maxFileSize) return false;
        return config.allowedFileTypes.includes(file.type);
    },

    date: (date) => {
        return !isNaN(Date.parse(date));
    },

    url: (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
};

export const errorMessages = {
    email: 'Por favor, introduce un email válido',
    password: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número',
    phone: 'El teléfono debe tener 9 dígitos',
    file: 'El archivo debe ser una imagen o PDF y no puede superar los 10MB',
    required: 'Este campo es obligatorio',
    passwordsMatch: 'Las contraseñas no coinciden',
    date: 'Por favor, introduce una fecha válida',
    url: 'Por favor, introduce una URL válida'
};

export const showError = (element, message) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    element.classList.add('is-invalid');
    element.parentNode.appendChild(errorDiv);
    logger.warn('Error de validación', { element: element.id, message });
};

export const clearError = (element) => {
    element.classList.remove('is-invalid');
    const errorDiv = element.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
};

export const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
};

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

export const showLoading = (element) => {
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border text-primary';
    spinner.setAttribute('role', 'status');
    element.disabled = true;
    element.appendChild(spinner);
};

export const hideLoading = (element) => {
    element.disabled = false;
    const spinner = element.querySelector('.spinner-border');
    if (spinner) {
        spinner.remove();
    }
};

export const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 5000);
};

export const handleApiError = (error) => {
    logger.error('Error en la API', error);
    showNotification('Ha ocurrido un error. Por favor, intenta de nuevo más tarde.', 'danger');
}; 