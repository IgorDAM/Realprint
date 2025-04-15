document.addEventListener('DOMContentLoaded', async () => {
    if (!auth.protectRoute('OPE')) {
        return;
    }

    try {
        // Cargar estadísticas
        await loadStatistics();
        
        // Cargar tareas activas
        await loadTareasActivas();
        
        // Cargar gráfico de progreso
        await loadProgresoChart();
    } catch (error) {
        console.error('Error al cargar el dashboard:', error);
        showError('Error al cargar la información del dashboard');
    }
});

async function loadStatistics() {
    try {
        const response = await fetch('/api/operario/estadisticas');
        if (!response.ok) throw new Error('Error al cargar estadísticas');
        
        const stats = await response.json();
        
        // Actualizar tarjetas de estadísticas
        document.getElementById('tareasPendientes').textContent = stats.tareas_pendientes;
        document.getElementById('tareasCompletadas').textContent = stats.tareas_completadas;
        document.getElementById('tiempoPromedio').textContent = `${stats.tiempo_promedio} min`;
        document.getElementById('tareasUrgentes').textContent = stats.tareas_urgentes;
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        throw error;
    }
}

async function loadTareasActivas() {
    try {
        const response = await fetch('/api/operario/tareas');
        if (!response.ok) throw new Error('Error al cargar tareas');
        
        const tareas = await response.json();
        const tbody = document.querySelector('#tareasTable tbody');
        tbody.innerHTML = '';

        tareas.forEach(tarea => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${tarea.id_tarea}</td>
                <td>${tarea.id_pedido}</td>
                <td>${tarea.descripcion}</td>
                <td><span class="badge bg-${getPriorityBadgeClass(tarea.prioridad)}">${tarea.prioridad}</span></td>
                <td>${formatDate(tarea.fecha_inicio)}</td>
                <td>${formatDate(tarea.fecha_estimada)}</td>
                <td><span class="badge bg-${getStatusBadgeClass(tarea.estado)}">${tarea.estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="updateTareaEstado(${tarea.id_tarea})">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar tareas:', error);
        throw error;
    }
}

async function loadProgresoChart() {
    try {
        const response = await fetch('/api/operario/progreso');
        if (!response.ok) throw new Error('Error al cargar progreso');
        
        const data = await response.json();
        const ctx = document.getElementById('progresoChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Tareas Completadas',
                    data: data.tareas_completadas,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error al cargar gráfico de progreso:', error);
        throw error;
    }
}

async function updateTareaEstado(tareaId) {
    try {
        const response = await fetch(`/api/operario/tareas/${tareaId}`);
        if (!response.ok) throw new Error('Error al cargar tarea');
        
        const tarea = await response.json();
        
        // Rellenar formulario del modal
        document.getElementById('tareaId').value = tareaId;
        document.getElementById('estado').value = tarea.estado;
        document.getElementById('notas').value = tarea.notas || '';
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('estadoModal'));
        modal.show();
    } catch (error) {
        console.error('Error al cargar tarea:', error);
        showError('Error al cargar la tarea');
    }
}

document.getElementById('guardarEstado').addEventListener('click', async () => {
    try {
        const tareaId = document.getElementById('tareaId').value;
        const estado = document.getElementById('estado').value;
        const notas = document.getElementById('notas').value;
        
        const response = await fetch(`/api/operario/tareas/${tareaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado, notas })
        });
        
        if (!response.ok) throw new Error('Error al actualizar tarea');
        
        // Cerrar modal y recargar datos
        bootstrap.Modal.getInstance(document.getElementById('estadoModal')).hide();
        await loadTareasActivas();
        await loadStatistics();
    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        showError('Error al actualizar la tarea');
    }
});

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function getPriorityBadgeClass(prioridad) {
    switch (prioridad) {
        case 'Alta':
            return 'danger';
        case 'Media':
            return 'warning';
        case 'Baja':
            return 'success';
        default:
            return 'secondary';
    }
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'Pendiente':
            return 'warning';
        case 'En Proceso':
            return 'info';
        case 'Completado':
            return 'success';
        case 'Problema':
            return 'danger';
        default:
            return 'secondary';
    }
}

function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container-fluid').prepend(alertDiv);
} 