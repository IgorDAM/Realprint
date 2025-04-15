class StateManager {
    constructor() {
        this.state = {};
        this.listeners = new Map();
        this.initializeState();
    }

    // Inicializar estado
    initializeState() {
        // Cargar estado persistente
        this.loadPersistedState();
        
        // Configurar sincronización
        this.setupSync();
        
        // Configurar eventos
        this.setupEvents();
    }

    // Cargar estado persistente
    loadPersistedState() {
        try {
            const persistedState = localStorage.getItem('appState');
            if (persistedState) {
                this.state = JSON.parse(persistedState);
            }
        } catch (error) {
            console.error('Error cargando estado persistente:', error);
        }
    }

    // Guardar estado persistente
    savePersistedState() {
        try {
            localStorage.setItem('appState', JSON.stringify(this.state));
        } catch (error) {
            console.error('Error guardando estado persistente:', error);
        }
    }

    // Configurar sincronización
    setupSync() {
        // Sincronizar entre pestañas
        window.addEventListener('storage', (event) => {
            if (event.key === 'appState') {
                this.state = JSON.parse(event.newValue);
                this.notifyListeners('*');
            }
        });

        // Sincronizar con servidor
        setInterval(() => {
            this.syncWithServer();
        }, 30000); // Cada 30 segundos
    }

    // Sincronizar con servidor
    async syncWithServer() {
        try {
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...securityManager.addCSRFToken()
                },
                body: JSON.stringify(this.state)
            });

            if (response.ok) {
                const serverState = await response.json();
                this.mergeState(serverState);
            }
        } catch (error) {
            console.error('Error sincronizando con servidor:', error);
        }
    }

    // Fusionar estados
    mergeState(newState) {
        this.state = {
            ...this.state,
            ...newState
        };
        this.savePersistedState();
        this.notifyListeners('*');
    }

    // Configurar eventos
    setupEvents() {
        // Eventos de navegación
        window.addEventListener('popstate', () => {
            this.setState('route', window.location.pathname);
        });

        // Eventos de autenticación
        document.addEventListener('authStateChange', (event) => {
            this.setState('auth', event.detail);
        });
    }

    // Obtener estado
    getState(key) {
        return key ? this.state[key] : this.state;
    }

    // Establecer estado
    setState(key, value) {
        this.state[key] = value;
        this.savePersistedState();
        this.notifyListeners(key);
    }

    // Suscribirse a cambios
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
        
        // Devolver función para desuscribirse
        return () => {
            this.listeners.get(key).delete(callback);
        };
    }

    // Notificar a los listeners
    notifyListeners(key) {
        const listeners = this.listeners.get(key) || new Set();
        const globalListeners = this.listeners.get('*') || new Set();
        
        [...listeners, ...globalListeners].forEach(callback => {
            try {
                callback(this.state);
            } catch (error) {
                console.error('Error en listener:', error);
            }
        });
    }

    // Resetear estado
    resetState() {
        this.state = {};
        this.savePersistedState();
        this.notifyListeners('*');
    }

    // Limpiar recursos
    cleanup() {
        this.listeners.clear();
    }
}

// Instancia global del gestor de estado
const stateManager = new StateManager();

// Limpiar al cerrar la página
window.addEventListener('beforeunload', () => {
    stateManager.cleanup();
});

// Exportar el gestor de estado
window.stateManager = stateManager; 