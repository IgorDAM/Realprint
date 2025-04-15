import { expect } from 'chai';
import {
    isAuthenticated,
    protectRoute,
    login,
    logout,
    getUserInfo
} from '../js/auth.js';

const request = require('supertest');
const app = require('../server');
const { query } = require('../db/conexion');

describe('Authentication Functions', () => {
    beforeEach(() => {
        // Limpiar sessionStorage antes de cada test
        sessionStorage.clear();
    });

    describe('isAuthenticated', () => {
        it('should return false when no user is logged in', () => {
            expect(isAuthenticated()).to.be.false;
        });

        it('should return true when a user is logged in', () => {
            sessionStorage.setItem('userId', '123');
            expect(isAuthenticated()).to.be.true;
        });
    });

    describe('protectRoute', () => {
        it('should redirect to login when not authenticated', () => {
            const mockWindow = {
                location: {
                    href: ''
                }
            };
            global.window = mockWindow;
            
            protectRoute();
            expect(mockWindow.location.href).to.equal('/login.html');
        });

        it('should not redirect when authenticated', () => {
            sessionStorage.setItem('userId', '123');
            const mockWindow = {
                location: {
                    href: ''
                }
            };
            global.window = mockWindow;
            
            protectRoute();
            expect(mockWindow.location.href).to.equal('');
        });

        it('should check role when required', () => {
            sessionStorage.setItem('userId', '123');
            sessionStorage.setItem('userRole', 'admin');
            
            const mockWindow = {
                location: {
                    href: ''
                }
            };
            global.window = mockWindow;
            
            protectRoute('admin');
            expect(mockWindow.location.href).to.equal('');
            
            protectRoute('superadmin');
            expect(mockWindow.location.href).to.equal('/login.html');
        });
    });

    describe('login', () => {
        it('should store user info on successful login', async () => {
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({
                    userId: '123',
                    role: 'user',
                    token: 'test-token'
                })
            };
            
            global.fetch = () => Promise.resolve(mockResponse);
            
            await login('test@example.com', 'password123');
            
            expect(sessionStorage.getItem('userId')).to.equal('123');
            expect(sessionStorage.getItem('userRole')).to.equal('user');
            expect(sessionStorage.getItem('token')).to.equal('test-token');
        });

        it('should handle login errors', async () => {
            const mockResponse = {
                ok: false,
                status: 401
            };
            
            global.fetch = () => Promise.resolve(mockResponse);
            
            try {
                await login('test@example.com', 'wrong-password');
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Credenciales inválidas');
            }
        });
    });

    describe('logout', () => {
        it('should clear session storage and redirect', () => {
            sessionStorage.setItem('userId', '123');
            sessionStorage.setItem('userRole', 'user');
            sessionStorage.setItem('token', 'test-token');
            
            const mockWindow = {
                location: {
                    href: ''
                }
            };
            global.window = mockWindow;
            
            logout();
            
            expect(sessionStorage.getItem('userId')).to.be.null;
            expect(sessionStorage.getItem('userRole')).to.be.null;
            expect(sessionStorage.getItem('token')).to.be.null;
            expect(mockWindow.location.href).to.equal('/login.html');
        });
    });

    describe('getUserInfo', () => {
        it('should fetch user info when authenticated', async () => {
            sessionStorage.setItem('userId', '123');
            sessionStorage.setItem('token', 'test-token');
            
            const mockUserData = {
                id: '123',
                name: 'Test User',
                email: 'test@example.com'
            };
            
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve(mockUserData)
            };
            
            global.fetch = () => Promise.resolve(mockResponse);
            
            const userInfo = await getUserInfo();
            expect(userInfo).to.deep.equal(mockUserData);
        });

        it('should handle errors when fetching user info', async () => {
            sessionStorage.setItem('userId', '123');
            
            const mockResponse = {
                ok: false,
                status: 404
            };
            
            global.fetch = () => Promise.resolve(mockResponse);
            
            try {
                await getUserInfo();
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Usuario no encontrado');
            }
        });

        it('should throw error when not authenticated', async () => {
            try {
                await getUserInfo();
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Usuario no autenticado');
            }
        });
    });
});

describe('Authentication API', () => {
    beforeAll(async () => {
        // Limpiar la base de datos antes de las pruebas
        await query('DELETE FROM usuarios WHERE email = ?', ['test@example.com']);
    });

    afterAll(async () => {
        // Limpiar después de las pruebas
        await query('DELETE FROM usuarios WHERE email = ?', ['test@example.com']);
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user with valid data', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    nombre: 'Test',
                    apellidos: 'User',
                    email: 'test@example.com',
                    telefono: '+34612345678',
                    direccion: 'Calle Test 123',
                    pais: 'España',
                    ciudad: 'Madrid',
                    password: 'Test123!'
                });

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('id');
        });

        it('should reject registration with invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    nombre: 'Test',
                    apellidos: 'User',
                    email: 'invalid-email',
                    telefono: '+34612345678',
                    direccion: 'Calle Test 123',
                    pais: 'España',
                    ciudad: 'Madrid',
                    password: 'Test123!'
                });

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('errors');
        });

        it('should reject registration with weak password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    nombre: 'Test',
                    apellidos: 'User',
                    email: 'test2@example.com',
                    telefono: '+34612345678',
                    direccion: 'Calle Test 123',
                    pais: 'España',
                    ciudad: 'Madrid',
                    password: 'weak'
                });

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('errors');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'Test123!'
                });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
        });

        it('should reject login with invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(response.statusCode).toBe(401);
            expect(response.body).toHaveProperty('error');
        });
    });
}); 