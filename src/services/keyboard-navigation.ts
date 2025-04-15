class KeyboardNavigation {
    private focusableElements: string;
    private currentFocusIndex: number;
    private focusableElementsList: HTMLElement[];

    constructor() {
        this.focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        this.currentFocusIndex = 0;
        this.focusableElementsList = [];
        this.setupKeyboardNavigation();
    }

    private setupKeyboardNavigation(): void {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.updateFocusableElements();
        
        const observer = new MutationObserver(() => {
            this.updateFocusableElements();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    private updateFocusableElements(): void {
        this.focusableElementsList = Array.from(
            document.querySelectorAll(this.focusableElements)
        ).filter(element => {
            const style = window.getComputedStyle(element);
            return style.display !== 'none' && 
                   style.visibility !== 'hidden' && 
                   !element.hasAttribute('disabled');
        }) as HTMLElement[];
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Tab') {
            event.preventDefault();
            
            if (event.shiftKey) {
                this.focusPrevious();
            } else {
                this.focusNext();
            }
        } else if (event.key === 'Enter' || event.key === ' ') {
            const activeElement = document.activeElement as HTMLElement;
            if (activeElement && activeElement.tagName === 'BUTTON') {
                activeElement.click();
            }
        }
    }

    private focusNext(): void {
        this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableElementsList.length;
        this.focusableElementsList[this.currentFocusIndex].focus();
    }

    private focusPrevious(): void {
        this.currentFocusIndex = (this.currentFocusIndex - 1 + this.focusableElementsList.length) % this.focusableElementsList.length;
        this.focusableElementsList[this.currentFocusIndex].focus();
    }

    public focusFirst(): void {
        if (this.focusableElementsList.length > 0) {
            this.currentFocusIndex = 0;
            this.focusableElementsList[0].focus();
        }
    }

    public focusLast(): void {
        if (this.focusableElementsList.length > 0) {
            this.currentFocusIndex = this.focusableElementsList.length - 1;
            this.focusableElementsList[this.currentFocusIndex].focus();
        }
    }

    public addFocusableElement(element: HTMLElement): void {
        if (!this.focusableElementsList.includes(element)) {
            this.focusableElementsList.push(element);
        }
    }

    public removeFocusableElement(element: HTMLElement): void {
        const index = this.focusableElementsList.indexOf(element);
        if (index !== -1) {
            this.focusableElementsList.splice(index, 1);
            if (this.currentFocusIndex >= this.focusableElementsList.length) {
                this.currentFocusIndex = Math.max(0, this.focusableElementsList.length - 1);
            }
        }
    }

    public setFocusableElements(selector: string): void {
        this.focusableElements = selector;
        this.updateFocusableElements();
    }
}

// Inicializar navegación por teclado
const keyboardNavigation = new KeyboardNavigation();

// Exportar el gestor de navegación por teclado
export default keyboardNavigation; 