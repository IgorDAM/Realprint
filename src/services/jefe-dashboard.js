// Verificar autenticación y rol
document.addEventListener('DOMContentLoaded', () => {
    const userInfo = getUserInfo();
    if (!isAuthenticated() || !userInfo || userInfo.role !== 'jefe') {
        window.location.href = '../login.html';
        return;
    }

    // Mostrar nombre de usuario
    document.getElementById('userName').textContent = userInfo.nombre;

    // Inicializar el dashboard
    initDashboard();
});

// Variables globales
let produccionChart = null;
let trabajoChart = null;

// Inicializar el dashboard
function initDashboard() {
    // Cargar datos iniciales
    cargarEstadisticas();
    cargarPedidosProduccion();
    inicializarGraficos();
    inicializarEventListeners();
}

// Inicializar event listeners
function inicializarEventListeners() {
    // Evento de cierre de sesión
    document.getElementById('logoutBtn').addEventListener('click', () => {
        logout();
        window.location.href = '../login.html';
    });

    // Eventos de navegación
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.getAttribute('href');
            if (target) {
                window.location.href = target;
            }
        });
    });
}

// Cargar estadísticas
async function cargarEstadisticas() {
    try {
        const response = await fetch('/api/jefe/estadisticas', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar estadísticas');

        const stats = await response.json();
        
        // Actualizar tarjetas
        document.getElementById('pedidosProduccion').textContent = stats.pedidosProduccion;
        document.getElementById('pedidosCompletados').textContent = stats.pedidosCompletados;
        document.getElementById('operariosActivos').textContent = stats.operariosActivos;
        document.getElementById('pedidosAtrasados').textContent = stats.pedidosAtrasados;

        // Actualizar gráficos
        actualizarGraficoProduccion(stats.produccionDiaria);
        actualizarGraficoTrabajo(stats.distribucionTrabajo);
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al cargar estadísticas', 'error');
    }
}

// Cargar pedidos en producción
async function cargarPedidosProduccion() {
    try {
        const response = await fetch('/api/jefe/pedidos/produccion', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar pedidos');

        const pedidos = await response.json();
        const tbody = document.querySelector('#pedidosTable tbody');
        tbody.innerHTML = '';

        pedidos.forEach(pedido => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${pedido.id}</td>
                <td>${pedido.cliente}</td>
                <td>${pedido.producto}</td>
                <td>${pedido.operario}</td>
                <td>${new Date(pedido.inicio).toLocaleString()}</td>
                <td>${new Date(pedido.finEstimado).toLocaleString()}</td>
                <td>
                    <span class="badge bg-${getEstadoColor(pedido.estado)}">
                        ${pedido.estado}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="verDetallesPedido(${pedido.id})">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editarPedido(${pedido.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al cargar pedidos', 'error');
    }
}

// Inicializar gráficos
function inicializarGraficos() {
    // Gráfico de producción
    const ctxProduccion = document.getElementById('produccionChart').getContext('2d');
    produccionChart = new Chart(ctxProduccion, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Pedidos Completados',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
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

    // Gráfico de distribución de trabajo
    const ctxTrabajo = document.getElementById('trabajoChart').getContext('2d');
    trabajoChart = new Chart(ctxTrabajo, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
}

// Actualizar gráfico de producción
function actualizarGraficoProduccion(datos) {
    produccionChart.data.labels = datos.map(d => d.fecha);
    produccionChart.data.datasets[0].data = datos.map(d => d.cantidad);
    produccionChart.update();
}

// Actualizar gráfico de trabajo
function actualizarGraficoTrabajo(datos) {
    trabajoChart.data.labels = datos.map(d => d.operario);
    trabajoChart.data.datasets[0].data = datos.map(d => d.pedidos);
    trabajoChart.update();
}

// Obtener color según estado
function getEstadoColor(estado) {
    switch (estado.toLowerCase()) {
        case 'en progreso':
            return 'primary';
        case 'completado':
            return 'success';
        case 'atrasado':
            return 'danger';
        default:
            return 'secondary';
    }
}

// Ver detalles de pedido
function verDetallesPedido(id) {
    window.location.href = `pedido-detalle.html?id=${id}`;
}

// Editar pedido
function editarPedido(id) {
    window.location.href = `editar-pedido.html?id=${id}`;
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo) {
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
        document.body.removeChild(toast);
    });
} 