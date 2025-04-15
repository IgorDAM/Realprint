class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.errors = new Map();
        this.rules = new Map();
    }

    // Añadir regla de validación
    addRule(fieldName, rule) {
        if (!this.rules.has(fieldName)) {
            this.rules.set(fieldName, []);
        }
        this.rules.get(fieldName).push(rule);
    }

    // Validar campo
    validateField(field) {
        const fieldName = field.name;
        const value = field.value;
        const rules = this.rules.get(fieldName) || [];

        for (const rule of rules) {
            const error = rule(value);
            if (error) {
                this.errors.set(fieldName, error);
                this.showError(field, error);
                return false;
            }
        }

        this.clearError(field);
        return true;
    }

    // Mostrar error
    showError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;

        field.classList.add('is-invalid');
        
        const existingError = field.nextElementSibling;
        if (existingError && existingError.classList.contains('invalid-feedback')) {
            existingError.remove();
        }
        
        field.parentNode.appendChild(errorDiv);
    }

    // Limpiar error
    clearError(field) {
        field.classList.remove('is-invalid');
        const errorDiv = field.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
            errorDiv.remove();
        }
        this.errors.delete(field.name);
    }

    // Validar formulario completo
    validateForm() {
        this.errors.clear();
        let isValid = true;

        for (const [fieldName, rules] of this.rules) {
            const field = this.form.elements[fieldName];
            if (field) {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            }
        }

        return isValid;
    }

    // Inicializar validación
    init() {
        this.form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
                this.showFormErrors();
            }
        });

        // Validación en tiempo real
        for (const [fieldName] of this.rules) {
            const field = this.form.elements[fieldName];
            if (field) {
                field.addEventListener('input', () => {
                    this.validateField(field);
                });
                field.addEventListener('blur', () => {
                    this.validateField(field);
                });
            }
        }
    }

    // Mostrar errores del formulario
    showFormErrors() {
        if (this.errors.size > 0) {
            const firstErrorField = this.form.elements[this.errors.keys().next().value];
            if (firstErrorField) {
                firstErrorField.focus();
            }
        }
    }
}

// Reglas de validación comunes
const validationRules = {
    required: (value) => !value ? 'Este campo es obligatorio' : null,
    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Ingrese un email válido' : null;
    },
    minLength: (min) => (value) => 
        value.length < min ? `Mínimo ${min} caracteres` : null,
    maxLength: (max) => (value) => 
        value.length > max ? `Máximo ${max} caracteres` : null,
    phone: (value) => {
        const phoneRegex = /^[0-9]{9,15}$/;
        return !phoneRegex.test(value) ? 'Ingrese un teléfono válido' : null;
    },
    password: (value) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return !passwordRegex.test(value) ? 
            'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número' : null;
    }
};

// Inicializar validadores para formularios específicos
document.addEventListener('DOMContentLoaded', () => {
    // Validación del formulario de registro
    const registerValidator = new FormValidator('registerForm');
    registerValidator.addRule('nombre', validationRules.required);
    registerValidator.addRule('nombre', validationRules.minLength(3));
    registerValidator.addRule('email', validationRules.required);
    registerValidator.addRule('email', validationRules.email);
    registerValidator.addRule('telefono', validationRules.phone);
    registerValidator.addRule('password', validationRules.password);
    registerValidator.init();

    // Validación del formulario de pedido
    const orderValidator = new FormValidator('orderForm');
    orderValidator.addRule('nombre', validationRules.required);
    orderValidator.addRule('email', validationRules.required);
    orderValidator.addRule('email', validationRules.email);
    orderValidator.addRule('telefono', validationRules.phone);
    orderValidator.addRule('descripcion', validationRules.required);
    orderValidator.addRule('descripcion', validationRules.minLength(10));
    orderValidator.init();
}); 