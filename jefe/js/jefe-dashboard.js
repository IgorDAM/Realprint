document.addEventListener('DOMContentLoaded', async () => {
    if (!auth.protectRoute('JEF')) {
        return;
    }

    try {
        // Cargar estadísticas
        await loadStatistics();
        
        // Cargar gráficos
        await loadCharts();
        
        // Cargar tabla de pedidos
        await loadPedidosTable();
    } catch (error) {
        console.error('Error al cargar el dashboard:', error);
        showError('Error al cargar la información del dashboard');
    }
});

// Función para cargar estadísticas
async function loadStatistics() {
    try {
        const response = await fetch('/api/jefe/estadisticas');
        if (!response.ok) throw new Error('Error al cargar estadísticas');
        
        const stats = await response.json();
        
        // Actualizar tarjetas de estadísticas
        document.getElementById('pedidosProduccion').textContent = stats.pedidos_produccion;
        document.getElementById('pedidosCompletados').textContent = stats.pedidos_completados;
        document.getElementById('operariosActivos').textContent = stats.operarios_activos;
        document.getElementById('pedidosAtrasados').textContent = stats.pedidos_atrasados;
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        throw error;
    }
}

// Función para cargar gráficos
async function loadCharts() {
    try {
        // Gráfico de producción
        const produccionCtx = document.getElementById('produccionChart').getContext('2d');
        new Chart(produccionCtx, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Pedidos Completados',
                    data: [12, 19, 3, 5, 2, 3, 7],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            }
        });

        // Gráfico de distribución de trabajo
        const trabajoCtx = document.getElementById('trabajoChart').getContext('2d');
        new Chart(trabajoCtx, {
            type: 'doughnut',
            data: {
                labels: ['DTF', 'Impresión Digital', 'Soportes Rígidos'],
                datasets: [{
                    data: [30, 50, 20],
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
                }]
            }
        });
    } catch (error) {
        console.error('Error al cargar gráficos:', error);
        throw error;
    }
}

// Función para cargar tabla de pedidos
async function loadPedidosTable() {
    try {
        const response = await fetch('/api/jefe/pedidos');
        if (!response.ok) throw new Error('Error al cargar pedidos');
        
        const pedidos = await response.json();
        const tbody = document.querySelector('#pedidosTable tbody');
        tbody.innerHTML = '';

        pedidos.forEach(pedido => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${pedido.id_pedido}</td>
                <td>${pedido.cliente}</td>
                <td>${pedido.producto}</td>
                <td>${pedido.operario}</td>
                <td>${formatDate(pedido.fecha_inicio)}</td>
                <td>${formatDate(pedido.fecha_estimada)}</td>
                <td><span class="badge bg-${getStatusBadgeClass(pedido.estado)}">${pedido.estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewPedido(${pedido.id_pedido})">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        throw error;
    }
}

// Función auxiliar para formatear fechas
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Función auxiliar para obtener la clase del badge según el estado
function getStatusBadgeClass(status) {
    switch (status) {
        case 'Pendiente':
            return 'warning';
        case 'En Proceso':
            return 'info';
        case 'Completado':
            return 'success';
        case 'Cancelado':
            return 'danger';
        default:
            return 'secondary';
    }
}

// Función para ver detalles de un pedido
function viewPedido(pedidoId) {
    window.location.href = `/jefe/pedidos/detalle.html?id=${pedidoId}`;
}

// Función para mostrar errores
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container-fluid').prepend(alertDiv);
}

// Mostrar nombre del usuario
document.getElementById('userName').textContent = sessionStorage.getItem('userName');

// Configurar evento de cierre de sesión
document.getElementById('logoutBtn').addEventListener('click', function() {
    logout();
});

// Configurar navegación
setupNavigation();

function setupNavigation() {
    document.getElementById('pedidosLink').addEventListener('click', () => {
        window.location.href = 'pedidos.html';
    });

    document.getElementById('produccionLink').addEventListener('click', () => {
        window.location.href = 'produccion.html';
    });

    document.getElementById('equipoLink').addEventListener('click', () => {
        window.location.href = 'equipo.html';
    });

    document.getElementById('reportesLink').addEventListener('click', () => {
        window.location.href = 'reportes.html';
    });
} 