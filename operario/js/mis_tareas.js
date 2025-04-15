// Importar funciones de la API
import { getTareas, actualizarProgresoTarea } from './api.js';

// Variables globales
let tareas = [];
let tareaSeleccionada = null;
let detallesModal;

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
    initMisTareas();
});

// Inicializar página
function initMisTareas() {
    // Configurar eventos
    setupEventListeners();
    
    // Inicializar modal
    detallesModal = new bootstrap.Modal(document.getElementById('detallesTareaModal'));
    
    // Cargar tareas
    cargarTareas();
}

// Configurar eventos
function setupEventListeners() {
    // Evento de cierre de sesión
    document.getElementById('logoutBtn').addEventListener('click', () => {
        logout();
        window.location.href = '../login.html';
    });

    // Eventos de filtros
    document.getElementById('btnFiltroHoy').addEventListener('click', () => filtrarTareas('hoy'));
    document.getElementById('btnFiltroSemana').addEventListener('click', () => filtrarTareas('semana'));
    document.getElementById('btnFiltroMes').addEventListener('click', () => filtrarTareas('mes'));

    // Evento de actualizar progreso
    document.getElementById('btnActualizarProgreso').addEventListener('click', actualizarProgreso);
}

// Cargar tareas
async function cargarTareas() {
    try {
        tareas = await getTareas();
        actualizarTablaTareas();
    } catch (error) {
        mostrarNotificacion('Error al cargar las tareas', 'error');
        console.error('Error:', error);
    }
}

// Actualizar tabla de tareas
function actualizarTablaTareas() {
    const tbody = document.querySelector('#tablaTareas tbody');
    tbody.innerHTML = '';
    
    tareas.forEach(tarea => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${tarea.id}</td>
            <td>${tarea.pedido}</td>
            <td>${tarea.maquina}</td>
            <td>${new Date(tarea.inicio).toLocaleString()}</td>
            <td>${new Date(tarea.finEstimado).toLocaleString()}</td>
            <td>
                <span class="badge bg-${getColorEstado(tarea.estado)}">
                    ${tarea.estado}
                </span>
            </td>
            <td>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${tarea.progreso}%">
                        ${tarea.progreso}%
                    </div>
                </div>
            </td>
            <td>
                <button class="btn btn-sm btn-info" onclick="verDetalles('${tarea.id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-primary" onclick="actualizarProgreso('${tarea.id}')">
                    <i class="bi bi-arrow-up-circle"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Obtener color según estado
function getColorEstado(estado) {
    switch (estado.toLowerCase()) {
        case 'pendiente':
            return 'warning';
        case 'en progreso':
            return 'primary';
        case 'completada':
            return 'success';
        case 'cancelada':
            return 'danger';
        default:
            return 'secondary';
    }
}

// Filtrar tareas
function filtrarTareas(filtro) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const tareasFiltradas = tareas.filter(tarea => {
        const fechaTarea = new Date(tarea.inicio);
        
        switch (filtro) {
            case 'hoy':
                return fechaTarea >= hoy;
            case 'semana':
                const inicioSemana = new Date(hoy);
                inicioSemana.setDate(hoy.getDate() - hoy.getDay());
                return fechaTarea >= inicioSemana;
            case 'mes':
                const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                return fechaTarea >= inicioMes;
            default:
                return true;
        }
    });
    
    actualizarTablaTareas(tareasFiltradas);
}

// Ver detalles de tarea
function verDetalles(id) {
    tareaSeleccionada = tareas.find(t => t.id === id);
    if (!tareaSeleccionada) return;
    
    // Actualizar modal
    document.getElementById('detalleId').textContent = tareaSeleccionada.id;
    document.getElementById('detallePedido').textContent = tareaSeleccionada.pedido;
    document.getElementById('detalleMaquina').textContent = tareaSeleccionada.maquina;
    document.getElementById('detalleEstado').textContent = tareaSeleccionada.estado;
    document.getElementById('detalleInicio').textContent = new Date(tareaSeleccionada.inicio).toLocaleString();
    document.getElementById('detalleFinEstimado').textContent = new Date(tareaSeleccionada.finEstimado).toLocaleString();
    document.getElementById('detalleProgreso').style.width = `${tareaSeleccionada.progreso}%`;
    document.getElementById('detalleNotas').textContent = tareaSeleccionada.notas || 'Sin notas';
    
    // Calcular tiempo transcurrido
    const ahora = new Date();
    const inicio = new Date(tareaSeleccionada.inicio);
    const diferencia = ahora - inicio;
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    document.getElementById('detalleTiempoTranscurrido').textContent = `${horas}h ${minutos}m`;
    
    // Mostrar modal
    detallesModal.show();
}

// Actualizar progreso de tarea
async function actualizarProgreso(id) {
    try {
        const tarea = tareas.find(t => t.id === id);
        if (!tarea) return;
        
        const nuevoProgreso = Math.min(tarea.progreso + 10, 100);
        await actualizarProgresoTarea(id, nuevoProgreso);
        
        tarea.progreso = nuevoProgreso;
        if (nuevoProgreso === 100) {
            tarea.estado = 'Completada';
        }
        
        actualizarTablaTareas();
        mostrarNotificacion(`Progreso actualizado a ${nuevoProgreso}%`, 'success');
        
        // Si el modal está abierto, actualizar los detalles
        if (tareaSeleccionada && tareaSeleccionada.id === id) {
            verDetalles(id);
        }
    } catch (error) {
        mostrarNotificacion('Error al actualizar el progreso', 'error');
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