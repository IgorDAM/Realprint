// Verificar autenticación y rol
document.addEventListener('DOMContentLoaded', () => {
    const userInfo = getUserInfo();
    if (!isAuthenticated() || !userInfo || userInfo.role !== 'operario') {
        window.location.href = '../login.html';
        return;
    }

    // Inicializar el dashboard
    initDashboard();
});

// Variables globales
let turnoIniciado = false;
let tiempoInicioTurno = null;
let timerInterval = null;

// Inicializar el dashboard
function initDashboard() {
    // Cargar datos iniciales
    cargarTareasActivas();
    cargarAlertasMaquinas();
    actualizarEstadisticas();
    cargarMaquinasDisponibles();

    // Event listeners
    document.getElementById('iniciarTurno').addEventListener('click', toggleTurno);
    document.getElementById('confirmarInicio').addEventListener('click', iniciarTarea);

    // Inicializar tooltips de Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Cargar tareas activas
async function cargarTareasActivas() {
    try {
        const response = await fetch('/api/tareas/activas', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar tareas');

        const tareas = await response.json();
        const tabla = document.getElementById('tablaTareasActivas');
        tabla.innerHTML = '';

        tareas.forEach(tarea => {
            const row = document.createElement('tr');
            row.innerHTML = `
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
                    <button class="btn btn-sm btn-primary" onclick="actualizarProgreso(${tarea.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="reportarProblema(${tarea.id})">
                        <i class="bi bi-exclamation-triangle"></i>
                    </button>
                </td>
            `;
            tabla.appendChild(row);
        });
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al cargar tareas activas', 'error');
    }
}

// Cargar alertas de máquinas
async function cargarAlertasMaquinas() {
    try {
        const response = await fetch('/api/maquinas/alertas', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar alertas');

        const alertas = await response.json();
        const contenedor = document.getElementById('alertasMaquinas');
        contenedor.innerHTML = '';

        alertas.forEach(alerta => {
            const div = document.createElement('div');
            div.className = `alert alert-${alerta.tipo} alert-dismissible fade show`;
            div.innerHTML = `
                <strong>${alerta.maquina}</strong>: ${alerta.mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            contenedor.appendChild(div);
        });
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al cargar alertas', 'error');
    }
}

// Actualizar estadísticas
async function actualizarEstadisticas() {
    try {
        const response = await fetch('/api/operario/estadisticas', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar estadísticas');

        const stats = await response.json();
        document.getElementById('tareasPendientes').textContent = stats.tareasPendientes;
        document.getElementById('eficienciaOperario').textContent = `${stats.eficiencia}%`;
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al cargar estadísticas', 'error');
    }
}

// Toggle turno
function toggleTurno() {
    const boton = document.getElementById('iniciarTurno');
    
    if (!turnoIniciado) {
        iniciarTurno();
        boton.innerHTML = '<i class="bi bi-stop-circle"></i> Finalizar Turno';
        boton.classList.remove('btn-primary');
        boton.classList.add('btn-danger');
    } else {
        finalizarTurno();
        boton.innerHTML = '<i class="bi bi-play-circle"></i> Iniciar Turno';
        boton.classList.remove('btn-danger');
        boton.classList.add('btn-primary');
    }
}

// Iniciar turno
async function iniciarTurno() {
    try {
        const response = await fetch('/api/turno/iniciar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Error al iniciar turno');

        turnoIniciado = true;
        tiempoInicioTurno = new Date();
        document.getElementById('estadoTurno').textContent = 'Turno en curso';
        
        // Iniciar timer
        timerInterval = setInterval(actualizarTiempoTurno, 1000);
        
        mostrarNotificacion('Turno iniciado correctamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al iniciar turno', 'error');
    }
}

// Finalizar turno
async function finalizarTurno() {
    try {
        const response = await fetch('/api/turno/finalizar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Error al finalizar turno');

        turnoIniciado = false;
        clearInterval(timerInterval);
        document.getElementById('estadoTurno').textContent = 'Turno finalizado';
        document.getElementById('tiempoTurno').textContent = '00:00:00';
        
        mostrarNotificacion('Turno finalizado correctamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al finalizar turno', 'error');
    }
}

// Actualizar tiempo del turno
function actualizarTiempoTurno() {
    if (!tiempoInicioTurno) return;

    const ahora = new Date();
    const diferencia = ahora - tiempoInicioTurno;
    
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);
    
    document.getElementById('tiempoTurno').textContent = 
        `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}

// Actualizar progreso de tarea
async function actualizarProgreso(tareaId) {
    try {
        const progreso = prompt('Ingrese el nuevo progreso (0-100):');
        if (progreso === null || progreso < 0 || progreso > 100) return;

        const response = await fetch(`/api/tareas/${tareaId}/progreso`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ progreso: parseInt(progreso) })
        });

        if (!response.ok) throw new Error('Error al actualizar progreso');

        mostrarNotificacion('Progreso actualizado correctamente', 'success');
        cargarTareasActivas();
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al actualizar progreso', 'error');
    }
}

// Reportar problema
async function reportarProblema(tareaId) {
    try {
        const descripcion = prompt('Describa el problema:');
        if (!descripcion) return;

        const response = await fetch(`/api/tareas/${tareaId}/problema`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ descripcion })
        });

        if (!response.ok) throw new Error('Error al reportar problema');

        mostrarNotificacion('Problema reportado correctamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al reportar problema', 'error');
    }
}

// Iniciar tarea
async function iniciarTarea() {
    try {
        const maquinaId = document.getElementById('maquinaTarea').value;
        const notas = document.getElementById('notasTarea').value;

        if (!maquinaId) {
            mostrarNotificacion('Por favor, selecciona una máquina', 'warning');
            return;
        }

        const response = await fetch('/api/tareas/iniciar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                maquinaId,
                notas
            })
        });

        if (!response.ok) throw new Error('Error al iniciar tarea');

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('iniciarTareaModal'));
        modal.hide();

        // Limpiar formulario
        document.getElementById('formIniciarTarea').reset();

        // Actualizar lista de tareas
        cargarTareasActivas();
        actualizarEstadisticas();

        mostrarNotificacion('Tarea iniciada correctamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al iniciar tarea', 'error');
    }
}

// Cargar máquinas disponibles
async function cargarMaquinasDisponibles() {
    try {
        const response = await fetch('/api/maquinas/disponibles', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar máquinas');

        const maquinas = await response.json();
        const select = document.getElementById('maquinaTarea');
        select.innerHTML = '<option value="">Seleccionar máquina</option>';

        maquinas.forEach(maquina => {
            const option = document.createElement('option');
            option.value = maquina.id;
            option.textContent = `${maquina.nombre} (${maquina.modelo})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al cargar máquinas disponibles', 'error');
    }
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo) {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alerta.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alerta);

    setTimeout(() => {
        alerta.remove();
    }, 5000);
} 