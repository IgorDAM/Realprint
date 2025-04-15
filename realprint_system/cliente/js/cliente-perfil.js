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

    // Configurar eventos de los formularios
    setupFormEvents();
});

async function loadClientData() {
    try {
        const clientData = await getClientInfo();
        
        // Rellenar información personal
        document.getElementById('nombre').value = clientData.nombre;
        document.getElementById('apellidos').value = clientData.apellidos;
        document.getElementById('email').value = clientData.email;
        document.getElementById('telefono').value = clientData.telefono;
        document.getElementById('empresa').value = clientData.empresa || '';
        document.getElementById('cif').value = clientData.cif || '';
        
        // Rellenar dirección de envío
        document.getElementById('direccion').value = clientData.direccion;
        document.getElementById('ciudad').value = clientData.ciudad;
        document.getElementById('codigoPostal').value = clientData.codigoPostal;
        document.getElementById('pais').value = clientData.pais || 'España';
        
        // Rellenar preferencias
        document.getElementById('notifyEmail').checked = clientData.notifyEmail;
        document.getElementById('notifySMS').checked = clientData.notifySMS;
        document.getElementById('language').value = clientData.language || 'es';
        
        // Rellenar información de la cuenta
        document.getElementById('registrationDate').textContent = formatDate(clientData.fechaRegistro);
        document.getElementById('lastLogin').textContent = formatDate(clientData.ultimoAcceso);
        document.getElementById('accountStatus').textContent = clientData.estado;
    } catch (error) {
        console.error('Error al cargar datos del cliente:', error);
        showError('Error al cargar los datos del cliente');
    }
}

function setupFormEvents() {
    // Formulario de información personal
    document.getElementById('personalInfoForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        try {
            const data = {
                nombre: document.getElementById('nombre').value,
                apellidos: document.getElementById('apellidos').value,
                email: document.getElementById('email').value,
                telefono: document.getElementById('telefono').value,
                empresa: document.getElementById('empresa').value,
                cif: document.getElementById('cif').value
            };
            
            await updateClientInfo(data);
            showSuccess('Información personal actualizada correctamente');
        } catch (error) {
            console.error('Error al actualizar información personal:', error);
            showError('Error al actualizar la información personal');
        }
    });

    // Formulario de dirección de envío
    document.getElementById('shippingAddressForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        try {
            const data = {
                direccion: document.getElementById('direccion').value,
                ciudad: document.getElementById('ciudad').value,
                codigoPostal: document.getElementById('codigoPostal').value,
                pais: document.getElementById('pais').value
            };
            
            await updateShippingAddress(data);
            showSuccess('Dirección de envío actualizada correctamente');
        } catch (error) {
            console.error('Error al actualizar dirección de envío:', error);
            showError('Error al actualizar la dirección de envío');
        }
    });

    // Formulario de cambio de contraseña
    document.getElementById('passwordForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            showError('Las contraseñas no coinciden');
            return;
        }

        try {
            await changePassword(currentPassword, newPassword);
            showSuccess('Contraseña actualizada correctamente');
            document.getElementById('passwordForm').reset();
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            showError('Error al cambiar la contraseña');
        }
    });

    // Formulario de preferencias
    document.getElementById('preferencesForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        try {
            const data = {
                notifyEmail: document.getElementById('notifyEmail').checked,
                notifySMS: document.getElementById('notifySMS').checked,
                language: document.getElementById('language').value
            };
            
            await updatePreferences(data);
            showSuccess('Preferencias actualizadas correctamente');
        } catch (error) {
            console.error('Error al actualizar preferencias:', error);
            showError('Error al actualizar las preferencias');
        }
    });

    // Botón de eliminar cuenta
    document.getElementById('deleteAccountBtn').addEventListener('click', function() {
        if (confirm('¿Está seguro de que desea eliminar su cuenta? Esta acción no se puede deshacer.')) {
            deleteAccount();
        }
    });
}

async function updateClientInfo(data) {
    // Implementar llamada a la API para actualizar información personal
    return new Promise((resolve) => {
        setTimeout(() => resolve(), 1000);
    });
}

async function updateShippingAddress(data) {
    // Implementar llamada a la API para actualizar dirección de envío
    return new Promise((resolve) => {
        setTimeout(() => resolve(), 1000);
    });
}

async function changePassword(currentPassword, newPassword) {
    // Implementar llamada a la API para cambiar contraseña
    return new Promise((resolve) => {
        setTimeout(() => resolve(), 1000);
    });
}

async function updatePreferences(data) {
    // Implementar llamada a la API para actualizar preferencias
    return new Promise((resolve) => {
        setTimeout(() => resolve(), 1000);
    });
}

async function deleteAccount() {
    try {
        // Implementar llamada a la API para eliminar cuenta
        await new Promise((resolve) => {
            setTimeout(() => resolve(), 1000);
        });
        logout();
    } catch (error) {
        console.error('Error al eliminar cuenta:', error);
        showError('Error al eliminar la cuenta');
    }
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function showError(message) {
    // Implementar notificación de error
    alert(message);
}

function showSuccess(message) {
    // Implementar notificación de éxito
    alert(message);
} 