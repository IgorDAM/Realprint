// Importar funciones de la API
import { getMaquinas, getAlertas, reportarProblema } from './api.js';

// Variables globales
let maquinas = [];
let maquinaSeleccionada = null;
let detallesModal;
let reporteModal;

// Verificar autenticación y rol
document.addEventListener('DOMContentLoaded', () => {
    const userInfo = getUserInfo();
    if (!isAuthenticated() || !userInfo || userInfo.role !== 'operario') {
        window.location.href = '../login.html';
        return;
    }

    // Mostrar nombre de usuario
    document.getElementById('userName').textContent = userInfo.name;

    // Inicializar
    initMisMaquinas();
});

// Inicializar página
function initMisMaquinas() {
    // Configurar eventos
    setupEventListeners();
    
    // Inicializar modales
    detallesModal = new bootstrap.Modal(document.getElementById('detallesMaquinaModal'));
    reporteModal = new bootstrap.Modal(document.getElementById('reportarProblemaModal'));
    
    // Cargar máquinas
    cargarMaquinas();
}

// Configurar eventos
function setupEventListeners() {
    // Evento de cierre de sesión
    document.getElementById('logoutBtn').addEventListener('click', () => {
        logout();
        window.location.href = '../login.html';
    });

    // Eventos de filtros
    document.getElementById('btnFiltroActivas').addEventListener('click', () => filtrarMaquinas('activas'));
    document.getElementById('btnFiltroMantenimiento').addEventListener('click', () => filtrarMaquinas('mantenimiento'));
    document.getElementById('btnFiltroTodas').addEventListener('click', () => filtrarMaquinas('todas'));

    // Evento de reportar problema
    document.getElementById('btnReportarProblema').addEventListener('click', () => {
        detallesModal.hide();
        reporteModal.show();
    });

    // Evento de enviar reporte
    document.getElementById('btnEnviarReporte').addEventListener('click', enviarReporte);
}

// Cargar máquinas
async function cargarMaquinas() {
    try {
        maquinas = await getMaquinas();
        actualizarTablaMaquinas();
    } catch (error) {
        mostrarNotificacion('Error al cargar las máquinas', 'error');
        console.error('Error:', error);
    }
}

// Actualizar tabla de máquinas
function actualizarTablaMaquinas(maquinasFiltradas = maquinas) {
    const tbody = document.querySelector('#tablaMaquinas tbody');
    tbody.innerHTML = '';
    
    maquinasFiltradas.forEach(maquina => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${maquina.id}</td>
            <td>${maquina.nombre}</td>
            <td>${maquina.tipo}</td>
            <td>
                <span class="badge bg-${getColorEstado(maquina.estado)}">
                    ${maquina.estado}
                </span>
            </td>
            <td>${new Date(maquina.ultimoMantenimiento).toLocaleDateString()}</td>
            <td>${new Date(maquina.proximoMantenimiento).toLocaleDateString()}</td>
            <td>${maquina.horasUso}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="verDetalles('${maquina.id}')">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Obtener color según estado
function getColorEstado(estado) {
    switch (estado.toLowerCase()) {
        case 'activa':
            return 'success';
        case 'en mantenimiento':
            return 'warning';
        case 'inactiva':
            return 'danger';
        default:
            return 'secondary';
    }
}

// Filtrar máquinas
function filtrarMaquinas(filtro) {
    const maquinasFiltradas = maquinas.filter(maquina => {
        switch (filtro) {
            case 'activas':
                return maquina.estado.toLowerCase() === 'activa';
            case 'mantenimiento':
                return maquina.estado.toLowerCase() === 'en mantenimiento';
            case 'todas':
                return true;
            default:
                return true;
        }
    });
    
    actualizarTablaMaquinas(maquinasFiltradas);
}

// Ver detalles de máquina
async function verDetalles(id) {
    maquinaSeleccionada = maquinas.find(m => m.id === id);
    if (!maquinaSeleccionada) return;
    
    try {
        // Obtener alertas de la máquina
        const alertas = await getAlertas();
        const alertasMaquina = alertas.filter(a => a.maquinaId === id);
        
        // Actualizar modal
        document.getElementById('detalleId').textContent = maquinaSeleccionada.id;
        document.getElementById('detalleNombre').textContent = maquinaSeleccionada.nombre;
        document.getElementById('detalleTipo').textContent = maquinaSeleccionada.tipo;
        document.getElementById('detalleEstado').textContent = maquinaSeleccionada.estado;
        document.getElementById('detalleUltimoMantenimiento').textContent = new Date(maquinaSeleccionada.ultimoMantenimiento).toLocaleString();
        document.getElementById('detalleProximoMantenimiento').textContent = new Date(maquinaSeleccionada.proximoMantenimiento).toLocaleString();
        document.getElementById('detalleHorasUso').textContent = maquinaSeleccionada.horasUso;
        
        // Actualizar alertas
        const contenedorAlertas = document.getElementById('detalleAlertas');
        contenedorAlertas.innerHTML = '';
        
        if (alertasMaquina.length === 0) {
            contenedorAlertas.innerHTML = '<div class="list-group-item">No hay alertas</div>';
        } else {
            alertasMaquina.forEach(alerta => {
                const div = document.createElement('div');
                div.className = `list-group-item list-group-item-${alerta.tipo}`;
                div.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${alerta.titulo}</h6>
                            <p class="mb-1">${alerta.mensaje}</p>
                            <small>${new Date(alerta.fecha).toLocaleString()}</small>
                        </div>
                        <i class="bi bi-exclamation-triangle-fill"></i>
                    </div>
                `;
                contenedorAlertas.appendChild(div);
            });
        }
        
        // Mostrar modal
        detallesModal.show();
        
    } catch (error) {
        mostrarNotificacion('Error al cargar los detalles', 'error');
        console.error('Error:', error);
    }
}

// Enviar reporte de problema
async function enviarReporte() {
    const tipo = document.getElementById('tipoProblema').value;
    const descripcion = document.getElementById('descripcionProblema').value;
    
    if (!tipo || !descripcion) {
        mostrarNotificacion('Completa todos los campos', 'error');
        return;
    }
    
    try {
        await reportarProblema(maquinaSeleccionada.id, tipo, descripcion);
        
        // Cerrar modal
        reporteModal.hide();
        
        // Limpiar formulario
        document.getElementById('formReportarProblema').reset();
        
        mostrarNotificacion('Problema reportado correctamente', 'success');
        
    } catch (error) {
        mostrarNotificacion('Error al reportar el problema', 'error');
        console.error('Error:', error);
    }
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${tipo} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${mensaje}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
} 