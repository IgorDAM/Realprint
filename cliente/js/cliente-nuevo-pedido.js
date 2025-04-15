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

    // Cargar datos del cliente
    loadClientData();

    // Configurar eventos del formulario
    setupFormEvents();

    // Configurar botón de contacto con soporte
    document.getElementById('contactSupportBtn').addEventListener('click', () => {
        window.location.href = 'mailto:soporte@realprint.com?subject=Consulta sobre nuevo pedido';
    });
});

async function loadClientData() {
    try {
        const clientData = await getClientInfo();
        
        // Rellenar campos del cliente
        document.getElementById('clientName').value = clientData.nombre;
        document.getElementById('clientEmail').value = clientData.email;
        document.getElementById('clientPhone').value = clientData.telefono;
        document.getElementById('clientCompany').value = clientData.empresa || '';
        
        // Rellenar dirección de envío
        document.getElementById('shippingAddress').value = clientData.direccion;
        document.getElementById('shippingCity').value = clientData.ciudad;
        document.getElementById('shippingPostalCode').value = clientData.codigoPostal;
        document.getElementById('shippingCountry').value = clientData.pais || 'España';
    } catch (error) {
        console.error('Error al cargar datos del cliente:', error);
        showError('Error al cargar los datos del cliente');
    }
}

function setupFormEvents() {
    // Configurar botón de agregar producto
    document.getElementById('addProductBtn').addEventListener('click', addProductRow);

    // Configurar envío del formulario
    document.getElementById('orderForm').addEventListener('submit', handleSubmit);

    // Agregar primera fila de producto
    addProductRow();
}

function addProductRow() {
    const container = document.getElementById('productsContainer');
    const productRow = document.createElement('div');
    productRow.className = 'product-row mb-3';
    productRow.innerHTML = `
        <div class="row">
            <div class="col-md-4">
                <div class="mb-3">
                    <label class="form-label">Producto</label>
                    <select class="form-select product-select" required>
                        <option value="">Seleccionar producto</option>
                        <option value="camisetas">Camisetas Personalizadas</option>
                        <option value="tazas">Tazas Personalizadas</option>
                        <option value="gorras">Gorras Personalizadas</option>
                        <option value="bolsas">Bolsas Personalizadas</option>
                    </select>
                </div>
            </div>
            <div class="col-md-2">
                <div class="mb-3">
                    <label class="form-label">Cantidad</label>
                    <input type="number" class="form-control product-quantity" min="1" value="1" required>
                </div>
            </div>
            <div class="col-md-4">
                <div class="mb-3">
                    <label class="form-label">Especificaciones</label>
                    <input type="text" class="form-control product-specs" placeholder="Color, tamaño, etc.">
                </div>
            </div>
            <div class="col-md-2">
                <div class="mb-3">
                    <label class="form-label">&nbsp;</label>
                    <button type="button" class="btn btn-danger d-block w-100 remove-product">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Agregar evento de cambio para actualizar el resumen
    productRow.querySelector('.product-select').addEventListener('change', updateOrderSummary);
    productRow.querySelector('.product-quantity').addEventListener('change', updateOrderSummary);

    // Agregar evento para eliminar producto
    productRow.querySelector('.remove-product').addEventListener('click', function() {
        productRow.remove();
        updateOrderSummary();
    });

    container.appendChild(productRow);
    updateOrderSummary();
}

function updateOrderSummary() {
    const tbody = document.querySelector('#orderSummary tbody');
    tbody.innerHTML = '';
    let total = 0;

    document.querySelectorAll('.product-row').forEach(row => {
        const product = row.querySelector('.product-select').value;
        const quantity = parseInt(row.querySelector('.product-quantity').value);
        const specs = row.querySelector('.product-specs').value;

        if (product) {
            const price = getProductPrice(product);
            const subtotal = price * quantity;
            total += subtotal;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${getProductName(product)} ${specs ? `(${specs})` : ''}</td>
                <td>${quantity}</td>
                <td>€${price.toFixed(2)}</td>
                <td>€${subtotal.toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        }
    });

    document.getElementById('orderTotal').textContent = `€${total.toFixed(2)}`;
}

function getProductPrice(product) {
    const prices = {
        'camisetas': 5.00,
        'tazas': 3.00,
        'gorras': 4.50,
        'bolsas': 2.50
    };
    return prices[product] || 0;
}

function getProductName(product) {
    const names = {
        'camisetas': 'Camisetas Personalizadas',
        'tazas': 'Tazas Personalizadas',
        'gorras': 'Gorras Personalizadas',
        'bolsas': 'Bolsas Personalizadas'
    };
    return names[product] || '';
}

async function handleSubmit(event) {
    event.preventDefault();

    // Validar archivos
    const files = document.getElementById('designFiles').files;
    if (files.length === 0) {
        showError('Debe adjuntar al menos un archivo de diseño');
        return;
    }

    // Recolectar datos del formulario
    const orderData = {
        cliente: {
            nombre: document.getElementById('clientName').value,
            email: document.getElementById('clientEmail').value,
            telefono: document.getElementById('clientPhone').value,
            empresa: document.getElementById('clientCompany').value
        },
        envio: {
            direccion: document.getElementById('shippingAddress').value,
            ciudad: document.getElementById('shippingCity').value,
            codigoPostal: document.getElementById('shippingPostalCode').value,
            pais: document.getElementById('shippingCountry').value
        },
        productos: [],
        archivos: [],
        notas: document.getElementById('orderNotes').value
    };

    // Recolectar productos
    document.querySelectorAll('.product-row').forEach(row => {
        const product = row.querySelector('.product-select').value;
        if (product) {
            orderData.productos.push({
                tipo: product,
                cantidad: parseInt(row.querySelector('.product-quantity').value),
                especificaciones: row.querySelector('.product-specs').value
            });
        }
    });

    // Validar productos
    if (orderData.productos.length === 0) {
        showError('Debe agregar al menos un producto');
        return;
    }

    try {
        // Subir archivos
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileData = await readFileAsBase64(file);
            orderData.archivos.push({
                nombre: file.name,
                contenido: fileData
            });
        }

        // Enviar pedido
        const response = await createOrder(orderData);
        showSuccess('Pedido creado correctamente');
        window.location.href = `pedido-detalle.html?id=${response.id}`;
    } catch (error) {
        console.error('Error al crear pedido:', error);
        showError('Error al crear el pedido');
    }
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
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
async function getClientInfo() {
    // Implementar llamada a la API
    return {
        nombre: 'Juan Pérez',
        email: 'juan.perez@email.com',
        telefono: '123456789',
        empresa: 'Mi Empresa',
        direccion: 'Calle Principal 123',
        ciudad: 'Madrid',
        codigoPostal: '28001',
        pais: 'España'
    };
}

async function createOrder(orderData) {
    // Implementar llamada a la API
    return {
        id: 123,
        fecha: new Date().toISOString(),
        estado: 'Pendiente'
    };
} 