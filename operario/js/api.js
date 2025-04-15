// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';
const API_ENDPOINTS = {
    MAQUINAS: '/maquinas',
    TAREAS: '/tareas',
    TURNOS: '/turnos',
    ALERTAS: '/alertas'
};

// Función para realizar peticiones a la API
async function fetchAPI(endpoint, options = {}) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
}

// Funciones específicas para el operario

// Obtener máquinas asignadas
export async function getMaquinas() {
    return await fetchAPI(API_ENDPOINTS.MAQUINAS);
}

// Obtener tareas asignadas
export async function getTareas() {
    return await fetchAPI(API_ENDPOINTS.TAREAS);
}

// Iniciar una nueva tarea
export async function iniciarTarea(maquinaId, notas) {
    return await fetchAPI(API_ENDPOINTS.TAREAS, {
        method: 'POST',
        body: JSON.stringify({ maquinaId, notas })
    });
}

// Actualizar progreso de una tarea
export async function actualizarProgresoTarea(tareaId, progreso) {
    return await fetchAPI(`${API_ENDPOINTS.TAREAS}/${tareaId}/progreso`, {
        method: 'PUT',
        body: JSON.stringify({ progreso })
    });
}

// Iniciar turno
export async function iniciarTurno() {
    return await fetchAPI(API_ENDPOINTS.TURNOS, {
        method: 'POST'
    });
}

// Finalizar turno
export async function finalizarTurno() {
    return await fetchAPI(API_ENDPOINTS.TURNOS, {
        method: 'PUT'
    });
}

// Obtener alertas de máquinas
export async function getAlertas() {
    return await fetchAPI(API_ENDPOINTS.ALERTAS);
}

// Obtener estado del turno actual
export async function getEstadoTurno() {
    return await fetchAPI(`${API_ENDPOINTS.TURNOS}/estado`);
} 