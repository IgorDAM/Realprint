// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    if (!auth.protectRoute('CLI')) {
        return;
    }

    try {
        // Cargar información del usuario
        const userInfo = await auth.getUserInfo();
        document.getElementById('userName').textContent = userInfo.nombre;

        // Cargar estadísticas
        await loadStatistics();
        
        // Cargar pedidos recientes
        await loadRecentOrders();
        
        // Cargar información del cliente
        await loadClientInfo();
    } catch (error) {
        console.error('Error al cargar el dashboard:', error);
        showError('Error al cargar la información del dashboard');
    }
});

// Función para cargar estadísticas
async function loadStatistics() {
    try {
        const response = await fetch('/api/cliente/estadisticas');
        if (!response.ok) {
            throw new Error('Error al cargar estadísticas');
        }
        
        const stats = await response.json();
        
        // Actualizar tarjetas de estadísticas
        document.getElementById('activeOrders').textContent = stats.pedidos_activos;
        document.getElementById('completedOrders').textContent = stats.pedidos_completados;
        document.getElementById('totalSpent').textContent = `${stats.gasto_total}€`;
        document.getElementById('pendingPayments').textContent = stats.pedidos_pendientes_pago;
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        throw error;
    }
}

// Función para cargar pedidos recientes
async function loadRecentOrders() {
    try {
        const response = await fetch('/api/cliente/pedidos/recientes');
        if (!response.ok) {
            throw new Error('Error al cargar pedidos recientes');
        }
        
        const orders = await response.json();
        const tbody = document.querySelector('#recentOrders tbody');
        tbody.innerHTML = '';

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id_pedido}</td>
                <td>${formatDate(order.fecha_pedido)}</td>
                <td>${order.producto}</td>
                <td>${order.cantidad}</td>
                <td>${order.total}€</td>
                <td><span class="badge bg-${getStatusBadgeClass(order.estado)}">${order.estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewOrder(${order.id_pedido})">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar pedidos recientes:', error);
        throw error;
    }
}

// Función para cargar información del cliente
async function loadClientInfo() {
    try {
        const response = await fetch('/api/cliente/info');
        if (!response.ok) {
            throw new Error('Error al cargar información del cliente');
        }
        
        const clientInfo = await response.json();
        
        // Actualizar información del cliente
        document.getElementById('clientName').textContent = clientInfo.nombre_empresa;
        document.getElementById('clientCIF').textContent = clientInfo.cif;
        document.getElementById('clientAddress').textContent = clientInfo.direccion;
        document.getElementById('clientCity').textContent = clientInfo.ciudad;
        document.getElementById('clientPostalCode').textContent = clientInfo.codigo_postal;
        document.getElementById('clientCountry').textContent = clientInfo.pais;
    } catch (error) {
        console.error('Error al cargar información del cliente:', error);
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
function viewOrder(orderId) {
    window.location.href = `/cliente/pedidos/detalle.html?id=${orderId}`;
}

// Función para mostrar errores
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container').prepend(alertDiv);
} 