class AccessibilityManager {
    constructor() {
        this.highContrastMode = false;
        this.fontSize = 16;
        this.setupAccessibility();
    }

    // Configurar accesibilidad inicial
    setupAccessibility() {
        this.addSkipLinks();
        this.setupKeyboardNavigation();
        this.setupARIALabels();
        this.addAccessibilityControls();
    }

    // Añadir enlaces de salto
    addSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Saltar al contenido principal</a>
            <a href="#navigation" class="skip-link">Saltar a la navegación</a>
        `;
        document.body.insertBefore(skipLinks, document.body.firstChild);
    }

    // Configurar navegación por teclado
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    // Configurar etiquetas ARIA
    setupARIALabels() {
        const images = document.querySelectorAll('img:not([alt])');
        images.forEach(img => {
            if (!img.alt) {
                img.alt = 'Imagen descriptiva';
            }
        });

        const buttons = document.querySelectorAll('button:not([aria-label])');
        buttons.forEach(button => {
            if (!button.textContent.trim()) {
                button.setAttribute('aria-label', 'Botón de acción');
            }
        });
    }

    // Añadir controles de accesibilidad
    addAccessibilityControls() {
        const controls = document.createElement('div');
        controls.className = 'accessibility-controls';
        controls.innerHTML = `
            <button id="toggleHighContrast" aria-label="Alternar modo de alto contraste">
                <i class="fas fa-adjust"></i>
            </button>
            <button id="increaseFontSize" aria-label="Aumentar tamaño de fuente">
                <i class="fas fa-text-height"></i>
            </button>
            <button id="decreaseFontSize" aria-label="Disminuir tamaño de fuente">
                <i class="fas fa-text-width"></i>
            </button>
        `;
        document.body.appendChild(controls);

        // Event listeners para los controles
        document.getElementById('toggleHighContrast').addEventListener('click', () => this.toggleHighContrast());
        document.getElementById('increaseFontSize').addEventListener('click', () => this.changeFontSize(2));
        document.getElementById('decreaseFontSize').addEventListener('click', () => this.changeFontSize(-2));
    }

    // Alternar modo de alto contraste
    toggleHighContrast() {
        this.highContrastMode = !this.highContrastMode;
        document.body.classList.toggle('high-contrast', this.highContrastMode);
        
        // Guardar preferencia
        localStorage.setItem('highContrastMode', this.highContrastMode);
    }

    // Cambiar tamaño de fuente
    changeFontSize(delta) {
        this.fontSize = Math.max(12, Math.min(24, this.fontSize + delta));
        document.documentElement.style.fontSize = `${this.fontSize}px`;
        
        // Guardar preferencia
        localStorage.setItem('fontSize', this.fontSize);
    }

    // Cargar preferencias guardadas
    loadPreferences() {
        const savedHighContrast = localStorage.getItem('highContrastMode');
        const savedFontSize = localStorage.getItem('fontSize');

        if (savedHighContrast === 'true') {
            this.toggleHighContrast();
        }

        if (savedFontSize) {
            this.fontSize = parseInt(savedFontSize);
            this.changeFontSize(0);
        }
    }
}

// Estilos CSS para accesibilidad
const style = document.createElement('style');
style.textContent = `
    .skip-links {
        position: absolute;
        top: -40px;
        left: 0;
        z-index: 100;
    }

    .skip-link {
        position: absolute;
        top: 0;
        left: 0;
        background: #000;
        color: #fff;
        padding: 8px;
        z-index: 100;
        transition: top 0.3s;
    }

    .skip-link:focus {
        top: 0;
    }

    .keyboard-navigation *:focus {
        outline: 2px solid #007bff;
        outline-offset: 2px;
    }

    .high-contrast {
        filter: contrast(150%);
        background-color: #000;
        color: #fff;
    }

    .high-contrast a {
        color: #ffff00;
    }

    .accessibility-controls {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        gap: 10px;
    }

    .accessibility-controls button {
        background: #007bff;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 50%;
        cursor: pointer;
        transition: transform 0.2s;
    }

    .accessibility-controls button:hover {
        transform: scale(1.1);
    }
`;
document.head.appendChild(style);

// Instancia global del gestor de accesibilidad
const accessibilityManager = new AccessibilityManager();

// Cargar preferencias al iniciar
accessibilityManager.loadPreferences();

// Exportar el gestor de accesibilidad
window.accessibilityManager = accessibilityManager; 