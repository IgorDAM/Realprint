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

    // Configurar botón de nuevo pedido
    document.getElementById('nuevoPedidoBtn').addEventListener('click', function() {
        window.location.href = 'nuevo-pedido.html';
    });

    // Configurar filtros
    setupFilters();

    // Cargar pedidos iniciales
    loadOrders();
});

let currentPage = 1;
const ordersPerPage = 10;
let allOrders = [];

async function loadOrders() {
    try {
        // Obtener todos los pedidos del cliente
        allOrders = await getClientOrders();
        
        // Aplicar filtros y paginación
        applyFilters();
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        showError('Error al cargar los pedidos');
    }
}

function setupFilters() {
    // Configurar eventos de los filtros
    document.getElementById('filtroEstado').addEventListener('change', applyFilters);
    document.getElementById('filtroFechaInicio').addEventListener('change', applyFilters);
    document.getElementById('filtroFechaFin').addEventListener('change', applyFilters);
    document.getElementById('btnBuscar').addEventListener('click', applyFilters);
    document.getElementById('busqueda').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
}

function applyFilters() {
    const estado = document.getElementById('filtroEstado').value;
    const fechaInicio = document.getElementById('filtroFechaInicio').value;
    const fechaFin = document.getElementById('filtroFechaFin').value;
    const busqueda = document.getElementById('busqueda').value.toLowerCase();

    // Filtrar pedidos
    let filteredOrders = allOrders.filter(order => {
        const matchesEstado = !estado || order.estado === estado;
        const matchesFechaInicio = !fechaInicio || new Date(order.fecha) >= new Date(fechaInicio);
        const matchesFechaFin = !fechaFin || new Date(order.fecha) <= new Date(fechaFin);
        const matchesBusqueda = !busqueda || 
            order.id.toString().includes(busqueda) ||
            order.producto.toLowerCase().includes(busqueda);

        return matchesEstado && matchesFechaInicio && matchesFechaFin && matchesBusqueda;
    });

    // Actualizar paginación
    updatePagination(filteredOrders.length);

    // Mostrar pedidos de la página actual
    displayOrders(filteredOrders);
}

function displayOrders(orders) {
    const tbody = document.querySelector('#pedidosTable tbody');
    tbody.innerHTML = '';

    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const ordersToShow = orders.slice(startIndex, endIndex);

    ordersToShow.forEach(order => {
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
                ${order.estado === 'Pendiente' ? `
                    <button class="btn btn-sm btn-danger" onclick="cancelOrder(${order.id})">
                        <i class="bi bi-x-circle"></i>
                    </button>
                ` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updatePagination(totalOrders) {
    const totalPages = Math.ceil(totalOrders / ordersPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    // Botón anterior
    pagination.innerHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Anterior</a>
        </li>
    `;

    // Números de página
    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }

    // Botón siguiente
    pagination.innerHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Siguiente</a>
        </li>
    `;
}

function changePage(page) {
    if (page >= 1 && page <= Math.ceil(allOrders.length / ordersPerPage)) {
        currentPage = page;
        applyFilters();
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

function viewOrder(orderId) {
    window.location.href = `pedido-detalle.html?id=${orderId}`;
}

async function downloadInvoice(orderId) {
    try {
        const invoice = await getOrderInvoice(orderId);
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

async function cancelOrder(orderId) {
    if (confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
        try {
            await cancelClientOrder(orderId);
            showSuccess('Pedido cancelado correctamente');
            loadOrders(); // Recargar lista de pedidos
        } catch (error) {
            console.error('Error al cancelar pedido:', error);
            showError('Error al cancelar el pedido');
        }
    }
}

function showError(message) {
    // Implementar notificación de error
    alert(message);
}

function showSuccess(message) {
    // Implementar notificación de éxito
    alert(message);
}

// Funciones para interactuar con la API
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
        {
            id: 2,
            fecha: '2024-03-10',
            producto: 'Tazas Personalizadas',
            cantidad: 100,
            total: 300.00,
            estado: 'Pendiente'
        },
        // Más pedidos...
    ];
}

async function getOrderInvoice(orderId) {
    // Implementar llamada a la API
    return new Blob(['Contenido de la factura'], { type: 'application/pdf' });
}

async function cancelClientOrder(orderId) {
    // Implementar llamada a la API para cancelar pedido
    return true;
} 