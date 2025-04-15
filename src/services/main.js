// Cache de elementos DOM
const cache = {
    elements: {},
    get: function(selector) {
        if (!this.elements[selector]) {
            this.elements[selector] = document.querySelector(selector);
        }
        return this.elements[selector];
    }
};

// Gestión de eventos
const EventManager = {
    handlers: new Map(),
    
    add: function(element, event, handler) {
        if (!this.handlers.has(element)) {
            this.handlers.set(element, new Map());
        }
        this.handlers.get(element).set(event, handler);
        element.addEventListener(event, handler);
    },
    
    remove: function(element, event) {
        if (this.handlers.has(element)) {
            const handler = this.handlers.get(element).get(event);
            if (handler) {
                element.removeEventListener(event, handler);
                this.handlers.get(element).delete(event);
            }
        }
    }
};

// Sistema de notificaciones
const NotificationSystem = {
    container: null,
    
    init: function() {
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    },
    
    show: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} animate-fade-in`;
        notification.textContent = message;
        
        this.container.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Optimización de imágenes
const ImageOptimizer = {
    init: function() {
        if ('loading' in HTMLImageElement.prototype) {
            this.lazyLoadNative();
        } else {
            this.lazyLoadFallback();
        }
    },
    
    lazyLoadNative: function() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    },
    
    lazyLoadFallback: function() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
};

// Gestión de formularios
const FormManager = {
    init: function() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            this.addValidation(form);
            this.addSubmitHandler(form);
        });
    },
    
    addValidation: function(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            EventManager.add(input, 'blur', () => this.validateInput(input));
            EventManager.add(input, 'input', () => this.validateInput(input));
        });
    },
    
    validateInput: function(input) {
        const value = input.value.trim();
        let isValid = true;
        let message = '';
        
        if (input.required && !value) {
            isValid = false;
            message = 'Este campo es obligatorio';
        } else if (input.type === 'email' && !this.isValidEmail(value)) {
            isValid = false;
            message = 'Por favor, introduce un email válido';
        } else if (input.type === 'tel' && !this.isValidPhone(value)) {
            isValid = false;
            message = 'Por favor, introduce un teléfono válido';
        }
        
        this.updateInputState(input, isValid, message);
        return isValid;
    },
    
    updateInputState: function(input, isValid, message) {
        input.classList.toggle('is-invalid', !isValid);
        input.classList.toggle('is-valid', isValid);
        
        let feedback = input.nextElementSibling;
        if (!feedback || !feedback.classList.contains('invalid-feedback')) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            input.parentNode.insertBefore(feedback, input.nextSibling);
        }
        
        feedback.textContent = message;
    },
    
    addSubmitHandler: function(form) {
        EventManager.add(form, 'submit', (e) => {
            e.preventDefault();
            
            const inputs = form.querySelectorAll('input, textarea, select');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!this.validateInput(input)) {
                    isValid = false;
                }
            });
            
            if (isValid) {
                this.handleSubmit(form);
            }
        });
    },
    
    handleSubmit: function(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Aquí se implementaría la lógica de envío del formulario
        console.log('Formulario válido:', data);
        NotificationSystem.show('Formulario enviado correctamente', 'success');
    },
    
    isValidEmail: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    isValidPhone: function(phone) {
        return /^[0-9]{9}$/.test(phone);
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    NotificationSystem.init();
    ImageOptimizer.init();
    FormManager.init();
    
    // Añadir animaciones a los elementos
    const animatedElements = document.querySelectorAll('.card, .btn, .feature');
    animatedElements.forEach(element => {
        element.classList.add('animate-fade-in');
    });
    
    // Mejorar la accesibilidad
    document.querySelectorAll('img').forEach(img => {
        if (!img.alt) {
            img.alt = 'Imagen descriptiva';
        }
    });
    
    // Mejorar el rendimiento
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
            // Tareas de baja prioridad
            console.log('Tareas de baja prioridad ejecutadas');
        });
    }
}); 