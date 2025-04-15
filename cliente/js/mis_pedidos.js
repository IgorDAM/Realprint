// Verificar autenticación y rol
document.addEventListener('DOMContentLoaded', () => {
    const userInfo = getUserInfo();
    if (!isAuthenticated() || !userInfo || userInfo.role !== 'cliente') {
        window.location.href = '../login.html';
        return;
    }

    // Mostrar nombre de usuario
    document.getElementById('userName').textContent = userInfo.name;

    // Inicializar pedidos
    initPedidos();
});

// Variables globales
let pedidos = [];
let pedidoModal;

// Inicializar pedidos
function initPedidos() {
    // Configurar eventos
    setupEventListeners();
    
    // Inicializar modal
    pedidoModal = new bootstrap.Modal(document.getElementById('pedidoModal'));
    
    // Cargar datos iniciales
    cargarPedidos();
}

// Configurar eventos
function setupEventListeners() {
    // Evento de cierre de sesión
    document.getElementById('logoutBtn').addEventListener('click', () => {
        logout();
        window.location.href = '../login.html';
    });

    // Evento de nuevo pedido
    document.getElementById('nuevoPedido').addEventListener('click', () => {
        window.location.href = 'nuevo_pedido.html';
    });

    // Eventos de filtros
    document.getElementById('filtroEstado').addEventListener('change', filtrarPedidos);
    document.getElementById('filtroFechaInicio').addEventListener('change', filtrarPedidos);
    document.getElementById('filtroFechaFin').addEventListener('change', filtrarPedidos);
    document.getElementById('filtroBusqueda').addEventListener('input', filtrarPedidos);
}

// Cargar pedidos
async function cargarPedidos() {
    try {
        // Simular carga de datos (reemplazar con llamada real a la API)
        pedidos = await simularCargaPedidos();
        
        // Actualizar tabla
        actualizarTablaPedidos(pedidos);
        
    } catch (error) {
        mostrarNotificacion('Error al cargar los pedidos', 'error');
        console.error('Error:', error);
    }
}

// Simular carga de pedidos
async function simularCargaPedidos() {
    // Simular retraso de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generar datos de ejemplo
    return Array.from({ length: 10 }, (_, i) => ({
        id: `PED-${1000 + i}`,
        fecha: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        producto: `Producto ${i + 1}`,
        cantidad: Math.floor(Math.random() * 100) + 1,
        estado: ['pendiente', 'en_produccion', 'completado', 'cancelado'][Math.floor(Math.random() * 4)],
        progreso: Math.floor(Math.random() * 100),
        precio: (Math.random() * 1000).toFixed(2)
    }));
}

// Filtrar pedidos
function filtrarPedidos() {
    const estado = document.getElementById('filtroEstado').value;
    const fechaInicio = document.getElementById('filtroFechaInicio').value;
    const fechaFin = document.getElementById('filtroFechaFin').value;
    const busqueda = document.getElementById('filtroBusqueda').value.toLowerCase();
    
    const pedidosFiltrados = pedidos.filter(pedido => {
        const cumpleEstado = !estado || pedido.estado === estado;
        const cumpleFechaInicio = !fechaInicio || pedido.fecha >= fechaInicio;
        const cumpleFechaFin = !fechaFin || pedido.fecha <= fechaFin;
        const cumpleBusqueda = !busqueda || 
            pedido.id.toLowerCase().includes(busqueda) ||
            pedido.producto.toLowerCase().includes(busqueda);
        
        return cumpleEstado && cumpleFechaInicio && cumpleFechaFin && cumpleBusqueda;
    });
    
    actualizarTablaPedidos(pedidosFiltrados);
}

// Actualizar tabla de pedidos
function actualizarTablaPedidos(pedidos) {
    const tbody = document.querySelector('#tablaPedidos tbody');
    tbody.innerHTML = '';
    
    pedidos.forEach(pedido => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${pedido.id}</td>
            <td>${pedido.fecha}</td>
            <td>${pedido.producto}</td>
            <td>${pedido.cantidad}</td>
            <td>
                <span class="badge bg-${getColorEstado(pedido.estado)}">
                    ${getTextoEstado(pedido.estado)}
                </span>
            </td>
            <td>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${pedido.progreso}%">
                        ${pedido.progreso}%
                    </div>
                </div>
            </td>
            <td>
                <button class="btn btn-sm btn-info" onclick="verDetallesPedido('${pedido.id}')">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Ver detalles del pedido
function verDetallesPedido(id) {
    const pedido = pedidos.find(p => p.id === id);
    if (!pedido) return;
    
    // Actualizar modal
    document.getElementById('modalPedidoId').textContent = pedido.id;
    document.getElementById('modalPedidoFecha').textContent = pedido.fecha;
    document.getElementById('modalPedidoEstado').textContent = getTextoEstado(pedido.estado);
    document.getElementById('modalPedidoProducto').textContent = pedido.producto;
    document.getElementById('modalPedidoCantidad').textContent = pedido.cantidad;
    document.getElementById('modalPedidoPrecio').textContent = `${pedido.precio} €`;
    
    const progressBar = document.getElementById('modalPedidoProgreso');
    progressBar.style.width = `${pedido.progreso}%`;
    progressBar.textContent = `${pedido.progreso}%`;
    progressBar.className = `progress-bar bg-${getColorEstado(pedido.estado)}`;
    
    // Mostrar modal
    pedidoModal.show();
}

// Obtener color según estado
function getColorEstado(estado) {
    switch (estado) {
        case 'pendiente': return 'warning';
        case 'en_produccion': return 'info';
        case 'completado': return 'success';
        case 'cancelado': return 'danger';
        default: return 'secondary';
    }
}

// Obtener texto según estado
function getTextoEstado(estado) {
    switch (estado) {
        case 'pendiente': return 'Pendiente';
        case 'en_produccion': return 'En Producción';
        case 'completado': return 'Completado';
        case 'cancelado': return 'Cancelado';
        default: return 'Desconocido';
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