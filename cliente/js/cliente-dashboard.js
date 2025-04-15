document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación y permisos
    if (!protectRoute('CLI')) {
        return;
    }

    // Mostrar nombre del usuario
    document.getElementById('userName').textContent = sessionStorage.getItem('userName');

    // Configurar evento de cierre de sesión
    document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
    });

    // Cargar datos del dashboard
    loadDashboardData();
    loadRecentOrders();
    loadClientInfo();

    // Configurar navegación
    setupNavigation();

    // Configurar botones
    setupButtons();
});

async function loadDashboardData() {
    try {
        // Obtener estadísticas del cliente
        const stats = await getClientStats();
        
        // Actualizar tarjetas de resumen
        document.getElementById('pedidosActivos').textContent = stats.pedidosActivos;
        document.getElementById('pedidosCompletados').textContent = stats.pedidosCompletados;
        document.getElementById('gastoTotal').textContent = `€${stats.gastoTotal.toFixed(2)}`;
        document.getElementById('pedidosPendientesPago').textContent = stats.pedidosPendientesPago;
    } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        showError('Error al cargar los datos del dashboard');
    }
}

async function loadRecentOrders() {
    try {
        const orders = await getClientOrders();
        const tbody = document.querySelector('#pedidosTable tbody');
        tbody.innerHTML = '';

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${new Date(order.fecha).toLocaleDateString()}</td>
                <td>${order.producto}</td>
                <td>${order.cantidad}</td>
                <td>€${order.total.toFixed(2)}</td>
                <td><span class="badge bg-${getStatusBadgeColor(order.estado)}">${order.estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewOrder(${order.id})">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="downloadInvoice(${order.id})">
                        <i class="bi bi-download"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        showError('Error al cargar los pedidos');
    }
}

async function loadClientInfo() {
    try {
        const clientInfo = await getClientInfo();
        
        // Actualizar información personal
        document.getElementById('clienteNombre').textContent = clientInfo.nombre;
        document.getElementById('clienteEmail').textContent = clientInfo.email;
        document.getElementById('clienteTelefono').textContent = clientInfo.telefono;
        
        // Actualizar dirección
        document.getElementById('clienteDireccion').textContent = clientInfo.direccion;
        document.getElementById('clienteCiudad').textContent = clientInfo.ciudad;
        document.getElementById('clienteCodigoPostal').textContent = clientInfo.codigoPostal;
    } catch (error) {
        console.error('Error al cargar información del cliente:', error);
        showError('Error al cargar la información del cliente');
    }
}

function getStatusBadgeColor(status) {
    const colors = {
        'Pendiente': 'warning',
        'En Proceso': 'info',
        'Completado': 'success',
        'Cancelado': 'danger',
        'Pendiente de Pago': 'warning'
    };
    return colors[status] || 'secondary';
}

function setupNavigation() {
    document.getElementById('pedidosLink').addEventListener('click', () => {
        window.location.href = 'pedidos.html';
    });

    document.getElementById('nuevoPedidoLink').addEventListener('click', () => {
        window.location.href = 'nuevo-pedido.html';
    });

    document.getElementById('perfilLink').addEventListener('click', () => {
        window.location.href = 'perfil.html';
    });
}

function setupButtons() {
    document.getElementById('nuevoPedidoBtn').addEventListener('click', () => {
        window.location.href = 'nuevo-pedido.html';
    });

    document.getElementById('editarPerfilBtn').addEventListener('click', () => {
        window.location.href = 'perfil.html';
    });
}

function viewOrder(orderId) {
    window.location.href = `pedido-detalle.html?id=${orderId}`;
}

async function downloadInvoice(orderId) {
    try {
        const invoice = await getOrderInvoice(orderId);
        // Implementar descarga del archivo
        const blob = new Blob([invoice], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error al descargar factura:', error);
        showError('Error al descargar la factura');
    }
}

function showError(message) {
    // Implementar notificación de error
    alert(message);
}

// Funciones para interactuar con la API
async function getClientStats() {
    // Implementar llamada a la API
    return {
        pedidosActivos: 3,
        pedidosCompletados: 12,
        gastoTotal: 1250.50,
        pedidosPendientesPago: 1
    };
}

async function getClientOrders() {
    // Implementar llamada a la API
    return [
        {
            id: 1,
            fecha: '2024-03-15',
            producto: 'Camisetas Personalizadas',
            cantidad: 50,
            total: 250.00,
            estado: 'En Proceso'
        },
        // Más pedidos...
    ];
}

async function getClientInfo() {
    // Implementar llamada a la API
    return {
        nombre: 'Juan Pérez',
        email: 'juan.perez@email.com',
        telefono: '123456789',
        direccion: 'Calle Principal 123',
        ciudad: 'Madrid',
        codigoPostal: '28001'
    };
}

async function getOrderInvoice(orderId) {
    // Implementar llamada a la API
    return new Blob(['Contenido de la factura'], { type: 'application/pdf' });
} 