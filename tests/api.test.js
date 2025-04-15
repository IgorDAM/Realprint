import { expect } from 'chai';
import { fetchOrders, createOrder, updateOrder, deleteOrder } from '../js/api.js';
const request = require('supertest');
const app = require('../server');
const { pool } = require('../db/conexion');

describe('API Functions', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    describe('fetchOrders', () => {
        it('should fetch orders when authenticated', async () => {
            sessionStorage.setItem('userId', '123');
            sessionStorage.setItem('token', 'test-token');
            
            const mockOrders = [
                { id: 1, status: 'pending' },
                { id: 2, status: 'completed' }
            ];
            
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve(mockOrders)
            };
            
            global.fetch = () => Promise.resolve(mockResponse);
            
            const orders = await fetchOrders();
            expect(orders).to.deep.equal(mockOrders);
        });

        it('should handle errors when fetching orders', async () => {
            sessionStorage.setItem('userId', '123');
            
            const mockResponse = {
                ok: false,
                status: 500
            };
            
            global.fetch = () => Promise.resolve(mockResponse);
            
            try {
                await fetchOrders();
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Error al obtener los pedidos');
            }
        });

        it('should throw error when not authenticated', async () => {
            try {
                await fetchOrders();
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Usuario no autenticado');
            }
        });
    });

    describe('createOrder', () => {
        it('should create order when authenticated', async () => {
            sessionStorage.setItem('userId', '123');
            sessionStorage.setItem('token', 'test-token');
            
            const orderData = {
                type: 'impresion',
                details: 'Test order'
            };
            
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({ id: 1, ...orderData })
            };
            
            global.fetch = () => Promise.resolve(mockResponse);
            
            const order = await createOrder(orderData);
            expect(order).to.deep.equal({ id: 1, ...orderData });
        });

        it('should handle validation errors', async () => {
            sessionStorage.setItem('userId', '123');
            
            const orderData = {
                type: 'invalid'
            };
            
            const mockResponse = {
                ok: false,
                status: 400,
                json: () => Promise.resolve({
                    message: 'Tipo de pedido inválido'
                })
            };
            
            global.fetch = () => Promise.resolve(mockResponse);
            
            try {
                await createOrder(orderData);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Tipo de pedido inválido');
            }
        });
    });

    describe('updateOrder', () => {
        it('should update order when authenticated', async () => {
            sessionStorage.setItem('userId', '123');
            sessionStorage.setItem('token', 'test-token');
            
            const orderData = {
                status: 'completed'
            };
            
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({ id: 1, ...orderData })
            };
            
            global.fetch = () => Promise.resolve(mockResponse);
            
            const order = await updateOrder(1, orderData);
            expect(order).to.deep.equal({ id: 1, ...orderData });
        });

        it('should handle not found errors', async () => {
            sessionStorage.setItem('userId', '123');
            
            const mockResponse = {
                ok: false,
                status: 404
            };
            
            global.fetch = () => Promise.resolve(mockResponse);
            
            try {
                await updateOrder(999, { status: 'completed' });
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Pedido no encontrado');
            }
        });
    });

    describe('deleteOrder', () => {
        it('should delete order when authenticated', async () => {
            sessionStorage.setItem('userId', '123');
            sessionStorage.setItem('token', 'test-token');
            
            const mockResponse = {
                ok: true
            };
            
            global.fetch = () => Promise.resolve(mockResponse);
            
            await deleteOrder(1);
            // No hay valor de retorno para verificar
        });

        it('should handle permission errors', async () => {
            sessionStorage.setItem('userId', '123');
            
            const mockResponse = {
                ok: false,
                status: 403
            };
            
            global.fetch = () => Promise.resolve(mockResponse);
            
            try {
                await deleteOrder(1);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('No tienes permiso para eliminar este pedido');
            }
        });
    });
});

describe('API Tests', () => {
    beforeAll(async () => {
        // Configurar base de datos de prueba
        await pool.query('START TRANSACTION');
    });

    afterAll(async () => {
        // Limpiar y cerrar conexión
        await pool.query('ROLLBACK');
        await pool.end();
    });

    describe('Autenticación', () => {
        test('Login exitoso', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });
            
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('token');
        });

        test('Login fallido', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });
            
            expect(response.statusCode).toBe(401);
        });
    });

    describe('Gestión de Pedidos', () => {
        let authToken;

        beforeAll(async () => {
            // Obtener token de autenticación
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });
            
            authToken = loginResponse.body.token;
        });

        test('Crear pedido', async () => {
            const response = await request(app)
                .post('/api/pedidos')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    cliente_id: 1,
                    fecha_entrega: '2024-04-20',
                    detalles: [
                        {
                            producto_id: 1,
                            cantidad: 10,
                            precio_unitario: 15.99
                        }
                    ]
                });
            
            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('id');
        });

        test('Obtener pedidos', async () => {
            const response = await request(app)
                .get('/api/pedidos')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('Gestión de Usuarios', () => {
        test('Crear usuario', async () => {
            const response = await request(app)
                .post('/api/usuarios')
                .send({
                    nombre: 'Test User',
                    email: 'newuser@example.com',
                    password: 'password123',
                    rol: 'cliente'
                });
            
            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('id');
        });

        test('Validar email único', async () => {
            const response = await request(app)
                .post('/api/usuarios')
                .send({
                    nombre: 'Test User',
                    email: 'test@example.com', // Email ya existente
                    password: 'password123',
                    rol: 'cliente'
                });
            
            expect(response.statusCode).toBe(400);
        });
    });
}); 