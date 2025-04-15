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

    // Obtener ID del pedido de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if (!orderId) {
        showError('No se ha especificado un ID de pedido');
        window.location.href = 'pedidos.html';
        return;
    }

    // Cargar datos del pedido
    loadOrderDetails(orderId);

    // Configurar botones
    setupButtons(orderId);
});

async function loadOrderDetails(orderId) {
    try {
        const order = await getOrderDetails(orderId);
        
        // Actualizar información general
        document.getElementById('orderId').textContent = order.id;
        document.getElementById('orderDate').textContent = new Date(order.fecha).toLocaleDateString();
        document.getElementById('orderStatusText').textContent = order.estado;
        document.getElementById('orderStatus').textContent = order.estado;
        document.getElementById('orderStatus').className = `badge bg-${getStatusBadgeColor(order.estado)}`;
        document.getElementById('orderTotal').textContent = `€${order.total.toFixed(2)}`;

        // Actualizar productos
        updateProductsTable(order.productos);

        // Actualizar seguimiento
        updateTimeline(order.seguimiento);

        // Actualizar información de envío
        updateShippingInfo(order.envio);

        // Actualizar notas
        updateNotes(order.notas);

        // Mostrar/ocultar botón de cancelación
        document.getElementById('cancelOrderBtn').style.display = 
            order.estado === 'Pendiente' ? 'block' : 'none';

    } catch (error) {
        console.error('Error al cargar detalles del pedido:', error);
        showError('Error al cargar los detalles del pedido');
    }
}

function updateProductsTable(products) {
    const tbody = document.querySelector('#productsTable tbody');
    tbody.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.nombre}</td>
            <td>${product.cantidad}</td>
            <td>€${product.precioUnitario.toFixed(2)}</td>
            <td>€${(product.cantidad * product.precioUnitario).toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
}

function updateTimeline(tracking) {
    const timeline = document.getElementById('orderTimeline');
    timeline.innerHTML = '';

    tracking.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'timeline-item';
        eventElement.innerHTML = `
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <h6>${event.estado}</h6>
                <p>${event.descripcion}</p>
                <small class="text-muted">${new Date(event.fecha).toLocaleString()}</small>
            </div>
        `;
        timeline.appendChild(eventElement);
    });
}

function updateShippingInfo(shipping) {
    const shippingInfo = document.getElementById('shippingInfo');
    shippingInfo.innerHTML = `
        <p><strong>Dirección:</strong> ${shipping.direccion}</p>
        <p><strong>Ciudad:</strong> ${shipping.ciudad}</p>
        <p><strong>Código Postal:</strong> ${shipping.codigoPostal}</p>
        <p><strong>Método de Envío:</strong> ${shipping.metodo}</p>
        ${shipping.numeroSeguimiento ? `
            <p><strong>Número de Seguimiento:</strong> ${shipping.numeroSeguimiento}</p>
        ` : ''}
    `;
}

function updateNotes(notes) {
    const orderNotes = document.getElementById('orderNotes');
    if (notes && notes.length > 0) {
        orderNotes.innerHTML = notes.map(note => `
            <div class="note-item mb-3">
                <p class="mb-1">${note.contenido}</p>
                <small class="text-muted">${new Date(note.fecha).toLocaleString()}</small>
            </div>
        `).join('');
    } else {
        orderNotes.innerHTML = '<p class="text-muted">No hay notas para este pedido.</p>';
    }
}

function setupButtons(orderId) {
    // Botón de descarga de factura
    document.getElementById('downloadInvoiceBtn').addEventListener('click', async () => {
        try {
            const invoice = await getOrderInvoice(orderId);
            downloadFile(invoice, `factura-${orderId}.pdf`);
        } catch (error) {
            console.error('Error al descargar factura:', error);
            showError('Error al descargar la factura');
        }
    });

    // Botón de descarga de archivos
    document.getElementById('downloadFilesBtn').addEventListener('click', async () => {
        try {
            const files = await getOrderFiles(orderId);
            files.forEach(file => {
                downloadFile(file.contenido, file.nombre);
            });
        } catch (error) {
            console.error('Error al descargar archivos:', error);
            showError('Error al descargar los archivos');
        }
    });

    // Botón de contacto con soporte
    document.getElementById('contactSupportBtn').addEventListener('click', () => {
        window.location.href = `mailto:soporte@realprint.com?subject=Consulta sobre pedido ${orderId}`;
    });

    // Botón de cancelación
    document.getElementById('cancelOrderBtn').addEventListener('click', async () => {
        if (confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
            try {
                await cancelOrder(orderId);
                showSuccess('Pedido cancelado correctamente');
                window.location.href = 'pedidos.html';
            } catch (error) {
                console.error('Error al cancelar pedido:', error);
                showError('Error al cancelar el pedido');
            }
        }
    });
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

function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
async function getOrderDetails(orderId) {
    // Implementar llamada a la API
    return {
        id: orderId,
        fecha: '2024-03-15',
        estado: 'En Proceso',
        total: 250.00,
        productos: [
            {
                nombre: 'Camisetas Personalizadas',
                cantidad: 50,
                precioUnitario: 5.00
            }
        ],
        seguimiento: [
            {
                estado: 'Pedido Recibido',
                descripcion: 'El pedido ha sido recibido y está siendo procesado',
                fecha: '2024-03-15T10:00:00'
            },
            {
                estado: 'En Producción',
                descripcion: 'El pedido está siendo fabricado',
                fecha: '2024-03-16T14:30:00'
            }
        ],
        envio: {
            direccion: 'Calle Principal 123',
            ciudad: 'Madrid',
            codigoPostal: '28001',
            metodo: 'Envío Estándar',
            numeroSeguimiento: 'ES123456789'
        },
        notas: [
            {
                contenido: 'El cliente ha solicitado una revisión del diseño antes de la producción',
                fecha: '2024-03-15T11:30:00'
            }
        ]
    };
}

async function getOrderFiles(orderId) {
    // Implementar llamada a la API
    return [
        {
            nombre: 'diseño-final.pdf',
            contenido: new Blob(['Contenido del archivo'], { type: 'application/pdf' })
        }
    ];
} 