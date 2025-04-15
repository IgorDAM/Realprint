class I18nManager {
    constructor() {
        this.translations = {};
        this.currentLocale = 'es';
        this.fallbackLocale = 'es';
        this.setupI18n();
    }

    // Configurar internacionalización
    setupI18n() {
        // Cargar traducciones
        this.loadTranslations();

        // Detectar idioma del navegador
        this.detectBrowserLanguage();

        // Configurar eventos
        this.setupEvents();
    }

    // Cargar traducciones
    async loadTranslations() {
        try {
            const locales = ['es', 'en', 'fr', 'de'];
            
            for (const locale of locales) {
                const response = await fetch(`/locales/${locale}.json`);
                if (response.ok) {
                    this.translations[locale] = await response.json();
                }
            }
        } catch (error) {
            console.error('Error cargando traducciones:', error);
        }
    }

    // Detectar idioma del navegador
    detectBrowserLanguage() {
        const browserLanguage = navigator.language.split('-')[0];
        if (this.translations[browserLanguage]) {
            this.currentLocale = browserLanguage;
        }
    }

    // Configurar eventos
    setupEvents() {
        // Cambiar idioma
        document.querySelectorAll('[data-locale]').forEach(element => {
            element.addEventListener('click', (event) => {
                const locale = event.target.dataset.locale;
                this.setLocale(locale);
            });
        });
    }

    // Establecer idioma
    setLocale(locale) {
        if (this.translations[locale]) {
            this.currentLocale = locale;
            localStorage.setItem('locale', locale);
            this.updateUI();
        }
    }

    // Actualizar interfaz
    updateUI() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            element.textContent = this.t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.dataset.i18nPlaceholder;
            element.placeholder = this.t(key);
        });

        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.dataset.i18nTitle;
            element.title = this.t(key);
        });
    }

    // Traducir texto
    t(key, params = {}) {
        let translation = this.getTranslation(key);
        
        if (!translation) {
            console.warn(`Translation missing for key: ${key}`);
            return key;
        }

        // Reemplazar parámetros
        Object.keys(params).forEach(param => {
            translation = translation.replace(`{${param}}`, params[param]);
        });

        return translation;
    }

    // Obtener traducción
    getTranslation(key) {
        const keys = key.split('.');
        let translation = this.translations[this.currentLocale];

        for (const k of keys) {
            if (translation && translation[k]) {
                translation = translation[k];
            } else {
                // Intentar con idioma de respaldo
                translation = this.translations[this.fallbackLocale];
                for (const k of keys) {
                    if (translation && translation[k]) {
                        translation = translation[k];
                    } else {
                        return null;
                    }
                }
                break;
            }
        }

        return translation;
    }

    // Formatear número
    formatNumber(number, options = {}) {
        return new Intl.NumberFormat(this.currentLocale, options).format(number);
    }

    // Formatear moneda
    formatCurrency(amount, currency = 'EUR', options = {}) {
        return new Intl.NumberFormat(this.currentLocale, {
            style: 'currency',
            currency,
            ...options
        }).format(amount);
    }

    // Formatear fecha
    formatDate(date, options = {}) {
        return new Intl.DateTimeFormat(this.currentLocale, options).format(date);
    }

    // Formatear hora
    formatTime(date, options = {}) {
        return new Intl.DateTimeFormat(this.currentLocale, {
            hour: 'numeric',
            minute: 'numeric',
            ...options
        }).format(date);
    }

    // Formatear fecha y hora
    formatDateTime(date, options = {}) {
        return new Intl.DateTimeFormat(this.currentLocale, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            ...options
        }).format(date);
    }

    // Obtener idioma actual
    getCurrentLocale() {
        return this.currentLocale;
    }

    // Obtener lista de idiomas disponibles
    getAvailableLocales() {
        return Object.keys(this.translations);
    }

    // Verificar si un idioma está disponible
    isLocaleAvailable(locale) {
        return this.translations.hasOwnProperty(locale);
    }
}

// Instancia global del gestor de internacionalización
const i18n = new I18nManager();

// Exportar el gestor de internacionalización
window.i18n = i18n; 