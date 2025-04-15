import { expect } from 'chai';
import { rateLimiter, cacheManager, DataValidator, ResourceOptimizer } from '../src/utils/rateLimiter.js';
import { getMaquinas, getTareas, iniciarTarea, actualizarProgresoTarea, iniciarTurno, finalizarTurno, getAlertas, getEstadoTurno } from '../operario/js/api.js';

describe('Rate Limiter', () => {
    it('debería permitir solicitudes dentro del límite', () => {
        const key = 'test-key';
        for (let i = 0; i < 50; i++) {
            expect(rateLimiter.checkLimit(key)).to.be.true;
        }
    });

    it('debería bloquear solicitudes excedidas', () => {
        const key = 'test-key-2';
        for (let i = 0; i < 100; i++) {
            rateLimiter.checkLimit(key);
        }
        expect(rateLimiter.checkLimit(key)).to.be.false;
    });
});

describe('Data Validator', () => {
    it('debería validar pedidos correctamente', () => {
        const pedidoValido = {
            id: 1,
            fecha: '2024-03-20',
            estado: 'pendiente',
            total: 100,
            progreso: 50
        };
        expect(DataValidator.validatePedido(pedidoValido)).to.be.empty;

        const pedidoInvalido = {
            id: '1',
            fecha: 'fecha-invalida',
            estado: 'estado-invalido',
            total: -100,
            progreso: 150
        };
        const errores = DataValidator.validatePedido(pedidoInvalido);
        expect(errores).to.have.lengthOf(5);
    });

    it('debería validar estadísticas correctamente', () => {
        const statsValidas = {
            totalPedidos: 10,
            pedidosPendientes: 5,
            gastoTotal: 1000,
            evolucionPedidos: []
        };
        expect(DataValidator.validateEstadisticas(statsValidas)).to.be.empty;

        const statsInvalidas = {
            totalPedidos: -1,
            pedidosPendientes: '5',
            gastoTotal: null,
            evolucionPedidos: 'no-es-un-array'
        };
        const errores = DataValidator.validateEstadisticas(statsInvalidas);
        expect(errores).to.have.lengthOf(4);
    });
});

describe('Cache Manager', () => {
    it('debería almacenar y recuperar datos correctamente', () => {
        const key = 'test-key';
        const value = { data: 'test' };
        cacheManager.set(key, value);
        expect(cacheManager.get(key)).to.deep.equal(value);
    });

    it('debería invalidar datos expirados', (done) => {
        const key = 'test-key-2';
        const value = { data: 'test' };
        cacheManager.set(key, value, 100); // TTL de 100ms

        setTimeout(() => {
            expect(cacheManager.get(key)).to.be.null;
            done();
        }, 200);
    });

    it('debería invalidar caché por patrón', () => {
        cacheManager.set('test-1', 'value1');
        cacheManager.set('test-2', 'value2');
        cacheManager.set('other', 'value3');

        cacheManager.invalidate(/^test-/);
        expect(cacheManager.get('test-1')).to.be.null;
        expect(cacheManager.get('test-2')).to.be.null;
        expect(cacheManager.get('other')).to.equal('value3');
    });
});

describe('Resource Optimizer', () => {
    it('debería comprimir y descomprimir datos correctamente', () => {
        const data = { test: 'data' };
        const compressed = ResourceOptimizer.compressData(data);
        const decompressed = ResourceOptimizer.decompressData(compressed);
        expect(decompressed).to.deep.equal(data);
    });

    it('debería optimizar imágenes', async () => {
        const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        const optimized = await ResourceOptimizer.optimizeImage(imageUrl, 100);
        expect(optimized).to.be.a('string');
        expect(optimized).to.include('data:image/jpeg');
    });
});

describe('Dashboard Operario', () => {
    // Pruebas de API
    describe('API Functions', () => {
        test('getMaquinas debería devolver un array de máquinas', async () => {
            const maquinas = await getMaquinas();
            expect(Array.isArray(maquinas)).toBe(true);
            expect(maquinas[0]).toHaveProperty('id');
            expect(maquinas[0]).toHaveProperty('nombre');
            expect(maquinas[0]).toHaveProperty('estado');
        });

        test('getTareas debería devolver un array de tareas', async () => {
            const tareas = await getTareas();
            expect(Array.isArray(tareas)).toBe(true);
            expect(tareas[0]).toHaveProperty('id');
            expect(tareas[0]).toHaveProperty('pedidoId');
            expect(tareas[0]).toHaveProperty('estado');
        });

        test('iniciarTarea debería actualizar el estado de la tarea', async () => {
            const tareaId = 'test-id';
            const maquinaId = 'test-maquina';
            const resultado = await iniciarTarea(tareaId, maquinaId);
            expect(resultado).toHaveProperty('success', true);
        });
    });

    // Pruebas de UI
    describe('UI Functions', () => {
        test('actualizarTablaTareas debería actualizar el DOM correctamente', () => {
            document.body.innerHTML = `
                <table id="tablaTareas">
                    <tbody></tbody>
                </table>
            `;
            
            const tareas = [{
                id: '1',
                pedidoId: 'P001',
                maquina: 'Máquina 1',
                horaInicio: new Date(),
                horaFinEstimada: new Date(),
                estado: 'En progreso',
                progreso: 50
            }];
            
            actualizarTablaTareas(tareas);
            const tbody = document.querySelector('#tablaTareas tbody');
            expect(tbody.children.length).toBe(1);
        });

        test('mostrarNotificacion debería crear un toast', () => {
            document.body.innerHTML = '';
            mostrarNotificacion('Test message', 'success');
            const toast = document.querySelector('.toast');
            expect(toast).not.toBeNull();
            expect(toast.classList.contains('bg-success')).toBe(true);
        });
    });

    // Pruebas de Estado
    describe('State Management', () => {
        test('toggleTurno debería cambiar el estado del turno', async () => {
            const estadoInicial = await getEstadoTurno();
            await toggleTurno();
            const estadoFinal = await getEstadoTurno();
            expect(estadoFinal.activo).not.toBe(estadoInicial.activo);
        });

        test('actualizarProgreso debería actualizar el progreso de la tarea', async () => {
            const tareaId = 'test-id';
            const nuevoProgreso = 75;
            const resultado = await actualizarProgreso(tareaId, nuevoProgreso);
            expect(resultado).toHaveProperty('progreso', nuevoProgreso);
        });
    });
}); 