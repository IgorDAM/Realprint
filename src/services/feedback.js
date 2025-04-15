class FeedbackManager {
    constructor() {
        this.toastContainer = null;
        this.initToastContainer();
    }

    // Inicializar contenedor de toasts
    initToastContainer() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(this.toastContainer);
    }

    // Mostrar toast
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        this.toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        // Eliminar toast después de que se oculte
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    // Mostrar mensaje de éxito
    success(message) {
        this.showToast(message, 'success');
    }

    // Mostrar mensaje de error
    error(message) {
        this.showToast(message, 'danger');
    }

    // Mostrar mensaje de advertencia
    warning(message) {
        this.showToast(message, 'warning');
    }

    // Mostrar mensaje informativo
    info(message) {
        this.showToast(message, 'info');
    }

    // Mostrar indicador de carga
    showLoading(message = 'Cargando...') {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-overlay';
        loadingDiv.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">${message}</p>
        `;
        document.body.appendChild(loadingDiv);
        return loadingDiv;
    }

    // Ocultar indicador de carga
    hideLoading(loadingDiv) {
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    // Mostrar modal de confirmación
    async confirm(message, title = 'Confirmar') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.setAttribute('tabindex', '-1');
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>${message}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="confirmButton">Aceptar</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            const bsModal = new bootstrap.Modal(modal);

            modal.querySelector('#confirmButton').addEventListener('click', () => {
                bsModal.hide();
                resolve(true);
            });

            modal.addEventListener('hidden.bs.modal', () => {
                modal.remove();
                resolve(false);
            });

            bsModal.show();
        });
    }
}

// Instancia global del gestor de feedback
const feedbackManager = new FeedbackManager();

// Estilos CSS para el feedback
const style = document.createElement('style');
style.textContent = `
    .toast-container {
        z-index: 1050;
    }
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1051;
    }
    .loading-overlay p {
        margin-top: 1rem;
        color: #333;
    }
`;
document.head.appendChild(style);

// Exportar el gestor de feedback
window.feedbackManager = feedbackManager; 