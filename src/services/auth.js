const { authenticateUser } = require('./conexion');

// Función para iniciar sesión
async function login(email, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al iniciar sesión');
        }

        // Guardar token y datos del usuario
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));

        // Redirigir según el rol
        switch (data.user.rol) {
            case 'ADM':
                window.location.href = '/admin/dashboard.html';
                break;
            case 'JEF':
                window.location.href = '/jefe-produccion/dashboard.html';
                break;
            case 'OPE':
                window.location.href = '/operario/dashboard.html';
                break;
            case 'CLI':
                window.location.href = '/cliente/dashboard.html';
                break;
            default:
                throw new Error('Rol no válido');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

// Función para cerrar sesión
function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/index.html';
}

// Función para verificar si el usuario está autenticado
function isAuthenticated() {
    return sessionStorage.getItem('token') !== null;
}

// Función para obtener el token
function getToken() {
    return sessionStorage.getItem('token');
}

// Función para obtener los datos del usuario
function getUser() {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Función para proteger rutas
function protectRoute(requiredRole) {
    if (!isAuthenticated()) {
        window.location.href = '/cliente.html';
        return false;
    }

    const user = getUser();
    if (requiredRole && user.rol !== requiredRole) {
        window.location.href = '/index.html';
        return false;
    }

    return true;
}

// Función para obtener información del usuario
async function getUserInfo() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) return null;

    try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error('Error al obtener información del usuario');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Inicializar la autenticación en la página
document.addEventListener('DOMContentLoaded', () => {
    const userNameElement = document.getElementById('userName');
    const logoutButton = document.getElementById('logoutBtn');

    if (userNameElement) {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
        userNameElement.textContent = userInfo.nombre || 'Usuario';
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});

// Exportar funciones
window.auth = {
    login,
    logout,
    isAuthenticated,
    getToken,
    getUser,
    protectRoute,
    getUserInfo
}; 