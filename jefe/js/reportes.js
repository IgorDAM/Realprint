// Verificar autenticación y rol
document.addEventListener('DOMContentLoaded', () => {
    const userInfo = getUserInfo();
    if (!isAuthenticated() || !userInfo || userInfo.role !== 'jefe') {
        window.location.href = '../login.html';
        return;
    }

    // Mostrar nombre de usuario
    document.getElementById('userName').textContent = userInfo.name;

    // Inicializar reportes
    initReportes();
});

// Variables globales
let evolucionChart;
let distribucionChart;

// Inicializar reportes
function initReportes() {
    // Configurar eventos
    setupEventListeners();
    
    // Cargar datos iniciales
    cargarDatosReporte();
}

// Configurar eventos
function setupEventListeners() {
    // Evento de cierre de sesión
    document.getElementById('logoutBtn').addEventListener('click', () => {
        logout();
        window.location.href = '../login.html';
    });

    // Evento de cambio de período
    document.getElementById('periodoReporte').addEventListener('change', (e) => {
        const fechaInicio = document.getElementById('fechaInicio');
        const fechaFin = document.getElementById('fechaFin');
        
        if (e.target.value === 'personalizado') {
            fechaInicio.disabled = false;
            fechaFin.disabled = false;
        } else {
            fechaInicio.disabled = true;
            fechaFin.disabled = true;
            actualizarFechasPorPeriodo(e.target.value);
        }
    });

    // Evento de generación de reporte
    document.getElementById('generarReporte').addEventListener('click', cargarDatosReporte);

    // Evento de exportación
    document.getElementById('exportarReporte').addEventListener('click', exportarReporte);
}

// Actualizar fechas según el período seleccionado
function actualizarFechasPorPeriodo(periodo) {
    const hoy = new Date();
    const fechaInicio = document.getElementById('fechaInicio');
    const fechaFin = document.getElementById('fechaFin');
    
    let fechaInicioCalculada = new Date();
    
    switch (periodo) {
        case 'diario':
            fechaInicioCalculada.setDate(hoy.getDate() - 1);
            break;
        case 'semanal':
            fechaInicioCalculada.setDate(hoy.getDate() - 7);
            break;
        case 'mensual':
            fechaInicioCalculada.setMonth(hoy.getMonth() - 1);
            break;
    }
    
    fechaInicio.value = fechaInicioCalculada.toISOString().split('T')[0];
    fechaFin.value = hoy.toISOString().split('T')[0];
}

// Cargar datos del reporte
async function cargarDatosReporte() {
    try {
        const tipoReporte = document.getElementById('tipoReporte').value;
        const fechaInicio = document.getElementById('fechaInicio').value;
        const fechaFin = document.getElementById('fechaFin').value;
        
        // Simular carga de datos (reemplazar con llamada real a la API)
        const datos = await simularCargaDatos(tipoReporte, fechaInicio, fechaFin);
        
        // Actualizar gráficos
        actualizarGraficos(datos);
        
        // Actualizar tabla
        actualizarTabla(datos);
        
    } catch (error) {
        mostrarNotificacion('Error al cargar los datos del reporte', 'error');
        console.error('Error:', error);
    }
}

// Simular carga de datos
async function simularCargaDatos(tipo, inicio, fin) {
    // Simular retraso de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generar datos de ejemplo según el tipo de reporte
    const datos = {
        evolucion: [],
        distribucion: [],
        tabla: []
    };
    
    const fechas = generarFechas(inicio, fin);
    
    switch (tipo) {
        case 'produccion':
            datos.evolucion = fechas.map(fecha => ({
                fecha,
                unidades: Math.floor(Math.random() * 1000),
                eficiencia: Math.random() * 100
            }));
            datos.distribucion = [
                { maquina: 'Máquina 1', porcentaje: 30 },
                { maquina: 'Máquina 2', porcentaje: 25 },
                { maquina: 'Máquina 3', porcentaje: 45 }
            ];
            break;
        case 'operarios':
            datos.evolucion = fechas.map(fecha => ({
                fecha,
                productividad: Math.random() * 100,
                horas: Math.floor(Math.random() * 8)
            }));
            datos.distribucion = [
                { operario: 'Operario 1', porcentaje: 40 },
                { operario: 'Operario 2', porcentaje: 35 },
                { operario: 'Operario 3', porcentaje: 25 }
            ];
            break;
        // Agregar más casos según sea necesario
    }
    
    return datos;
}

// Generar array de fechas
function generarFechas(inicio, fin) {
    const fechas = [];
    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);
    
    while (fechaInicio <= fechaFin) {
        fechas.push(fechaInicio.toISOString().split('T')[0]);
        fechaInicio.setDate(fechaInicio.getDate() + 1);
    }
    
    return fechas;
}

// Actualizar gráficos
function actualizarGraficos(datos) {
    // Destruir gráficos existentes si existen
    if (evolucionChart) evolucionChart.destroy();
    if (distribucionChart) distribucionChart.destroy();
    
    // Crear gráfico de evolución
    const ctxEvolucion = document.getElementById('evolucionChart').getContext('2d');
    evolucionChart = new Chart(ctxEvolucion, {
        type: 'line',
        data: {
            labels: datos.evolucion.map(d => d.fecha),
            datasets: [{
                label: 'Unidades',
                data: datos.evolucion.map(d => d.unidades),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Evolución de la Producción'
                }
            }
        }
    });
    
    // Crear gráfico de distribución
    const ctxDistribucion = document.getElementById('distribucionChart').getContext('2d');
    distribucionChart = new Chart(ctxDistribucion, {
        type: 'doughnut',
        data: {
            labels: datos.distribucion.map(d => d.maquina || d.operario),
            datasets: [{
                data: datos.distribucion.map(d => d.porcentaje),
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribución'
                }
            }
        }
    });
}

// Actualizar tabla
function actualizarTabla(datos) {
    const tbody = document.querySelector('#tablaReporte tbody');
    tbody.innerHTML = '';
    
    datos.evolucion.forEach(dato => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${dato.fecha}</td>
            <td>${dato.unidades || dato.productividad.toFixed(2)}</td>
            <td>${dato.eficiencia ? dato.eficiencia.toFixed(2) + '%' : dato.horas}</td>
            <td>${Math.random() * 1000 | 0}</td>
            <td>${Math.random() * 100 | 0}%</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="verDetalles('${dato.fecha}')">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Exportar reporte
function exportarReporte() {
    // Implementar lógica de exportación
    mostrarNotificacion('Reporte exportado correctamente', 'success');
}

// Ver detalles
function verDetalles(fecha) {
    // Implementar lógica para ver detalles
    mostrarNotificacion(`Viendo detalles de ${fecha}`, 'info');
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