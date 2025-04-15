// Verificar autenticación y rol
document.addEventListener('DOMContentLoaded', () => {
    const userInfo = getUserInfo();
    if (!isAuthenticated() || !userInfo || userInfo.role !== 'cliente') {
        window.location.href = '../login.html';
        return;
    }

    // Mostrar nombre de usuario
    document.getElementById('userName').textContent = userInfo.name;

    // Inicializar perfil
    initPerfil();
});

// Variables globales
let perfilData = {};

// Inicializar perfil
function initPerfil() {
    // Configurar eventos
    setupEventListeners();
    
    // Cargar datos iniciales
    cargarPerfil();
    cargarEstadisticas();
}

// Configurar eventos
function setupEventListeners() {
    // Evento de cierre de sesión
    document.getElementById('logoutBtn').addEventListener('click', () => {
        logout();
        window.location.href = '../login.html';
    });

    // Evento de cambio de avatar
    document.getElementById('cambiarAvatar').addEventListener('click', cambiarAvatar);

    // Evento de guardar perfil
    document.getElementById('formPerfil').addEventListener('submit', guardarPerfil);

    // Evento de cambiar contraseña
    document.getElementById('formPassword').addEventListener('submit', cambiarPassword);
}

// Cargar datos del perfil
async function cargarPerfil() {
    try {
        // Simular carga de datos (reemplazar con llamada real a la API)
        perfilData = await simularCargaPerfil();
        
        // Actualizar formulario
        actualizarFormularioPerfil();
        
    } catch (error) {
        mostrarNotificacion('Error al cargar el perfil', 'error');
        console.error('Error:', error);
    }
}

// Simular carga de perfil
async function simularCargaPerfil() {
    // Simular retraso de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generar datos de ejemplo
    return {
        nombre: 'Juan',
        apellidos: 'Pérez García',
        email: 'juan.perez@ejemplo.com',
        telefono: '123456789',
        empresa: 'Empresa S.L.',
        direccion: 'Calle Ejemplo, 123\n28001 Madrid',
        avatar: 'https://via.placeholder.com/150'
    };
}

// Actualizar formulario con datos del perfil
function actualizarFormularioPerfil() {
    document.getElementById('nombre').value = perfilData.nombre;
    document.getElementById('apellidos').value = perfilData.apellidos;
    document.getElementById('email').value = perfilData.email;
    document.getElementById('telefono').value = perfilData.telefono;
    document.getElementById('empresa').value = perfilData.empresa;
    document.getElementById('direccion').value = perfilData.direccion;
    
    // Actualizar información de usuario
    document.getElementById('nombreUsuario').textContent = `${perfilData.nombre} ${perfilData.apellidos}`;
    document.getElementById('emailUsuario').textContent = perfilData.email;
    document.querySelector('.rounded-circle').src = perfilData.avatar;
}

// Guardar cambios del perfil
async function guardarPerfil(event) {
    event.preventDefault();
    
    try {
        // Obtener datos del formulario
        const datos = {
            nombre: document.getElementById('nombre').value,
            apellidos: document.getElementById('apellidos').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            empresa: document.getElementById('empresa').value,
            direccion: document.getElementById('direccion').value
        };
        
        // Simular guardado (reemplazar con llamada real a la API)
        await simularGuardarPerfil(datos);
        
        // Actualizar datos locales
        perfilData = { ...perfilData, ...datos };
        
        // Actualizar información de usuario
        document.getElementById('nombreUsuario').textContent = `${datos.nombre} ${datos.apellidos}`;
        document.getElementById('emailUsuario').textContent = datos.email;
        
        mostrarNotificacion('Perfil actualizado correctamente', 'success');
        
    } catch (error) {
        mostrarNotificacion('Error al actualizar el perfil', 'error');
        console.error('Error:', error);
    }
}

// Simular guardado de perfil
async function simularGuardarPerfil(datos) {
    // Simular retraso de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    return datos;
}

// Cambiar contraseña
async function cambiarPassword(event) {
    event.preventDefault();
    
    try {
        const passwordActual = document.getElementById('passwordActual').value;
        const passwordNueva = document.getElementById('passwordNueva').value;
        const passwordConfirmar = document.getElementById('passwordConfirmar').value;
        
        // Validar contraseñas
        if (passwordNueva !== passwordConfirmar) {
            mostrarNotificacion('Las contraseñas no coinciden', 'error');
            return;
        }
        
        // Simular cambio de contraseña (reemplazar con llamada real a la API)
        await simularCambiarPassword(passwordActual, passwordNueva);
        
        // Limpiar formulario
        document.getElementById('formPassword').reset();
        
        mostrarNotificacion('Contraseña cambiada correctamente', 'success');
        
    } catch (error) {
        mostrarNotificacion('Error al cambiar la contraseña', 'error');
        console.error('Error:', error);
    }
}

// Simular cambio de contraseña
async function simularCambiarPassword(actual, nueva) {
    // Simular retraso de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
}

// Cambiar avatar
async function cambiarAvatar() {
    try {
        // Simular selección de archivo (reemplazar con implementación real)
        const file = await simularSeleccionArchivo();
        
        // Simular subida (reemplazar con llamada real a la API)
        const url = await simularSubirAvatar(file);
        
        // Actualizar imagen
        document.querySelector('.rounded-circle').src = url;
        perfilData.avatar = url;
        
        mostrarNotificacion('Avatar actualizado correctamente', 'success');
        
    } catch (error) {
        mostrarNotificacion('Error al cambiar el avatar', 'error');
        console.error('Error:', error);
    }
}

// Simular selección de archivo
async function simularSeleccionArchivo() {
    // Simular retraso
    await new Promise(resolve => setTimeout(resolve, 500));
    return { name: 'avatar.jpg', type: 'image/jpeg' };
}

// Simular subida de avatar
async function simularSubirAvatar(file) {
    // Simular retraso de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 'https://via.placeholder.com/150';
}

// Cargar estadísticas
async function cargarEstadisticas() {
    try {
        // Simular carga de estadísticas (reemplazar con llamada real a la API)
        const estadisticas = await simularCargaEstadisticas();
        
        // Actualizar contadores
        document.getElementById('totalPedidos').textContent = estadisticas.total;
        document.getElementById('pedidosActivos').textContent = estadisticas.activos;
        document.getElementById('pedidosCompletados').textContent = estadisticas.completados;
        
    } catch (error) {
        mostrarNotificacion('Error al cargar las estadísticas', 'error');
        console.error('Error:', error);
    }
}

// Simular carga de estadísticas
async function simularCargaEstadisticas() {
    // Simular retraso de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
        total: 25,
        activos: 3,
        completados: 22
    };
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