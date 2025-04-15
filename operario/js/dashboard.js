// Importar funciones de la API
import { 
    getMaquinas, 
    getTareas, 
    iniciarTarea as apiIniciarTarea, 
    actualizarProgresoTarea,
    iniciarTurno as apiIniciarTurno,
    finalizarTurno as apiFinalizarTurno,
    getAlertas,
    getEstadoTurno
} from './api.js';

// Verificar autenticación y rol
document.addEventListener('DOMContentLoaded', () => {
    const userInfo = getUserInfo();
    if (!isAuthenticated() || !userInfo || userInfo.role !== 'operario') {
        window.location.href = '../login.html';
        return;
    }

    // Mostrar nombre de usuario
    document.getElementById('userName').textContent = userInfo.name;

    // Inicializar dashboard
    initDashboard();
});

// Variables globales
let turnoActivo = false;
let inicioTurno = null;
let tareas = [];
let maquinas = [];
let tareaModal;
let intervaloEstado;

// Inicializar dashboard
function initDashboard() {
    // Configurar eventos
    setupEventListeners();
    
    // Inicializar modal
    tareaModal = new bootstrap.Modal(document.getElementById('iniciarTareaModal'));
    
    // Cargar datos iniciales
    cargarMaquinas();
    cargarTareas();
    cargarAlertas();
    verificarEstadoTurno();
}

// Configurar eventos
function setupEventListeners() {
    // Evento de cierre de sesión
    document.getElementById('logoutBtn').addEventListener('click', () => {
        logout();
        window.location.href = '../login.html';
    });

    // Evento de iniciar/finalizar turno
    document.getElementById('iniciarTurno').addEventListener('click', toggleTurno);

    // Evento de confirmar inicio de tarea
    document.getElementById('confirmarIniciarTarea').addEventListener('click', iniciarTarea);
}

// Cargar máquinas
async function cargarMaquinas() {
    try {
        maquinas = await getMaquinas();
        
        // Actualizar select de máquinas
        const select = document.getElementById('maquinaTarea');
        select.innerHTML = '<option value="">Seleccionar máquina</option>';
        
        maquinas.forEach(maquina => {
            const option = document.createElement('option');
            option.value = maquina.id;
            option.textContent = `${maquina.nombre} (${maquina.tipo})`;
            select.appendChild(option);
        });
        
    } catch (error) {
        mostrarNotificacion('Error al cargar las máquinas', 'error');
        console.error('Error:', error);
    }
}

// Cargar tareas
async function cargarTareas() {
    try {
        tareas = await getTareas();
        
        // Actualizar estadísticas
        actualizarEstadisticas();
        
        // Actualizar tabla
        actualizarTablaTareas();
        
    } catch (error) {
        mostrarNotificacion('Error al cargar las tareas', 'error');
        console.error('Error:', error);
    }
}

// Cargar alertas
async function cargarAlertas() {
    try {
        const alertas = await getAlertas();
        const contenedor = document.getElementById('alertasMaquinas');
        contenedor.innerHTML = '';
        
        alertas.forEach(alerta => {
            const div = document.createElement('div');
            div.className = `list-group-item list-group-item-${alerta.tipo}`;
            div.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${alerta.maquina}</h6>
                        <p class="mb-1">${alerta.mensaje}</p>
                        <small>${new Date(alerta.fecha).toLocaleString()}</small>
                    </div>
                    <i class="bi bi-exclamation-triangle-fill"></i>
                </div>
            `;
            contenedor.appendChild(div);
        });
        
    } catch (error) {
        console.error('Error al cargar las alertas:', error);
    }
}

// Verificar estado del turno
async function verificarEstadoTurno() {
    try {
        const estado = await getEstadoTurno();
        if (estado.activo) {
            turnoActivo = true;
            inicioTurno = new Date(estado.inicio);
            actualizarEstadoTurno();
            setInterval(actualizarEstadoTurno, 1000);
            
            const btn = document.getElementById('iniciarTurno');
            btn.innerHTML = '<i class="bi bi-stop-circle"></i> Finalizar Turno';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-danger');
        }
    } catch (error) {
        console.error('Error al verificar el estado del turno:', error);
    }
}

// Actualizar estadísticas
function actualizarEstadisticas() {
    const total = tareas.length;
    const completadas = tareas.filter(t => t.progreso === 100).length;
    const eficiencia = total > 0 ? Math.round((completadas / total) * 100) : 0;
    
    document.getElementById('totalTareas').textContent = total;
    document.getElementById('tareasCompletadas').textContent = completadas;
    document.getElementById('eficiencia').textContent = `${eficiencia}%`;
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
            <td>${new Date(tarea.inicio).toLocaleTimeString()}</td>
            <td>${new Date(tarea.finEstimado).toLocaleTimeString()}</td>
            <td>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${tarea.progreso}%">
                        ${tarea.progreso}%
                    </div>
                </div>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="actualizarProgreso('${tarea.id}')">
                    <i class="bi bi-arrow-up-circle"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Actualizar progreso de tarea
async function actualizarProgreso(id) {
    try {
        const tarea = tareas.find(t => t.id === id);
        if (!tarea) return;
        
        const nuevoProgreso = Math.min(tarea.progreso + 10, 100);
        await actualizarProgresoTarea(id, nuevoProgreso);
        
        tarea.progreso = nuevoProgreso;
        actualizarTablaTareas();
        actualizarEstadisticas();
        
        if (nuevoProgreso === 100) {
            mostrarNotificacion(`Tarea ${id} completada`, 'success');
        }
    } catch (error) {
        mostrarNotificacion('Error al actualizar el progreso', 'error');
        console.error('Error:', error);
    }
}

// Toggle turno
async function toggleTurno() {
    try {
        const btn = document.getElementById('iniciarTurno');
        
        if (!turnoActivo) {
            // Iniciar turno
            await apiIniciarTurno();
            turnoActivo = true;
            inicioTurno = new Date();
            btn.innerHTML = '<i class="bi bi-stop-circle"></i> Finalizar Turno';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-danger');
            
            // Actualizar estado
            actualizarEstadoTurno();
            
            // Iniciar temporizador
            intervaloEstado = setInterval(actualizarEstadoTurno, 1000);
            
            mostrarNotificacion('Turno iniciado', 'success');
        } else {
            // Finalizar turno
            await apiFinalizarTurno();
            turnoActivo = false;
            inicioTurno = null;
            btn.innerHTML = '<i class="bi bi-play-circle"></i> Iniciar Turno';
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-primary');
            
            // Actualizar estado
            actualizarEstadoTurno();
            
            // Limpiar intervalo
            if (intervaloEstado) {
                clearInterval(intervaloEstado);
            }
            
            mostrarNotificacion('Turno finalizado', 'info');
        }
    } catch (error) {
        mostrarNotificacion('Error al gestionar el turno', 'error');
        console.error('Error:', error);
    }
}

// Actualizar estado del turno
function actualizarEstadoTurno() {
    const progreso = document.getElementById('progresoTurno');
    const horaInicio = document.getElementById('horaInicio');
    const horaFin = document.getElementById('horaFin');
    
    if (turnoActivo && inicioTurno) {
        const ahora = new Date();
        const duracion = ahora - inicioTurno;
        const horas = Math.floor(duracion / (1000 * 60 * 60));
        const minutos = Math.floor((duracion % (1000 * 60 * 60)) / (1000 * 60));
        
        // Suponiendo un turno de 8 horas
        const porcentaje = Math.min((duracion / (8 * 60 * 60 * 1000)) * 100, 100);
        
        progreso.style.width = `${porcentaje}%`;
        horaInicio.textContent = inicioTurno.toLocaleTimeString();
        horaFin.textContent = new Date(inicioTurno.getTime() + 8 * 60 * 60 * 1000).toLocaleTimeString();
    } else {
        progreso.style.width = '0%';
        horaInicio.textContent = '--:--';
        horaFin.textContent = '--:--';
    }
}

// Iniciar tarea
async function iniciarTarea() {
    const maquinaId = document.getElementById('maquinaTarea').value;
    const notas = document.getElementById('notasTarea').value;
    
    if (!maquinaId) {
        mostrarNotificacion('Selecciona una máquina', 'error');
        return;
    }
    
    try {
        await apiIniciarTarea(maquinaId, notas);
        
        // Cerrar modal
        tareaModal.hide();
        
        // Recargar tareas
        cargarTareas();
        
        mostrarNotificacion('Tarea iniciada correctamente', 'success');
        
    } catch (error) {
        mostrarNotificacion('Error al iniciar la tarea', 'error');
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