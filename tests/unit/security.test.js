import { SecurityManager } from '../../js/security.js';

describe('SecurityManager', () => {
    let securityManager;

    beforeEach(() => {
        securityManager = new SecurityManager();
    });

    describe('Validación de Email', () => {
        test('debe aceptar emails válidos', () => {
            const emailsValidos = [
                'usuario@ejemplo.com',
                'usuario.nombre@ejemplo.com',
                'usuario+tag@ejemplo.com',
                'usuario@sub.dominio.com'
            ];

            emailsValidos.forEach(email => {
                expect(securityManager.validateEmail(email)).toBe(true);
            });
        });

        test('debe rechazar emails inválidos', () => {
            const emailsInvalidos = [
                'usuario',
                'usuario@',
                '@ejemplo.com',
                'usuario@ejemplo',
                'usuario@.com'
            ];

            emailsInvalidos.forEach(email => {
                expect(securityManager.validateEmail(email)).toBe(false);
            });
        });
    });

    describe('Validación de Contraseña', () => {
        test('debe aceptar contraseñas válidas', () => {
            const contraseñasValidas = [
                'Password123!',
                'Abcdefg1@',
                'P@ssw0rd',
                'Test123!@#'
            ];

            contraseñasValidas.forEach(password => {
                expect(securityManager.validatePassword(password)).toBe(true);
            });
        });

        test('debe rechazar contraseñas inválidas', () => {
            const contraseñasInvalidas = [
                'password',      // Sin mayúsculas
                'PASSWORD',      // Sin minúsculas
                'Password',      // Sin números
                'Password123',   // Sin caracteres especiales
                'P@ss',         // Muy corta
                '12345678'      // Solo números
            ];

            contraseñasInvalidas.forEach(password => {
                expect(securityManager.validatePassword(password)).toBe(false);
            });
        });
    });

    describe('Validación de Teléfono', () => {
        test('debe aceptar teléfonos válidos', () => {
            const telefonosValidos = [
                '123456789',
                '987654321',
                '555555555'
            ];

            telefonosValidos.forEach(phone => {
                expect(securityManager.validatePhone(phone)).toBe(true);
            });
        });

        test('debe rechazar teléfonos inválidos', () => {
            const telefonosInvalidos = [
                '12345678',     // Muy corto
                '1234567890',   // Muy largo
                'abcdefghi',    // Letras
                '123-456-789',  // Con guiones
                '123 456 789'   // Con espacios
            ];

            telefonosInvalidos.forEach(phone => {
                expect(securityManager.validatePhone(phone)).toBe(false);
            });
        });
    });

    describe('Sanitización de Input', () => {
        test('debe sanitizar input correctamente', () => {
            const inputs = [
                {
                    original: '<script>alert("xss")</script>',
                    esperado: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
                },
                {
                    original: 'Texto normal',
                    esperado: 'Texto normal'
                },
                {
                    original: 'Texto con <b>HTML</b>',
                    esperado: 'Texto con &lt;b&gt;HTML&lt;/b&gt;'
                }
            ];

            inputs.forEach(({ original, esperado }) => {
                expect(securityManager.sanitizeInput(original)).toBe(esperado);
            });
        });
    });

    describe('Validación de Formulario', () => {
        test('debe validar formulario completo correctamente', () => {
            const formularioValido = {
                email: 'usuario@ejemplo.com',
                password: 'Password123!',
                phone: '123456789'
            };

            const resultado = securityManager.validateForm(formularioValido);
            expect(resultado.isValid).toBe(true);
            expect(resultado.errors).toEqual({});
        });

        test('debe detectar errores en formulario inválido', () => {
            const formularioInvalido = {
                email: 'usuario',
                password: 'pass',
                phone: '123'
            };

            const resultado = securityManager.validateForm(formularioInvalido);
            expect(resultado.isValid).toBe(false);
            expect(resultado.errors).toHaveProperty('email');
            expect(resultado.errors).toHaveProperty('password');
            expect(resultado.errors).toHaveProperty('phone');
        });
    });

    describe('Generación de Token CSRF', () => {
        test('debe generar token CSRF válido', () => {
            const token = securityManager.generateCSRFToken();
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.length).toBeGreaterThan(0);
        });

        test('debe generar tokens únicos', () => {
            const token1 = securityManager.generateCSRFToken();
            const token2 = securityManager.generateCSRFToken();
            expect(token1).not.toBe(token2);
        });
    });

    describe('Encriptación de Datos', () => {
        test('debe encriptar datos correctamente', async () => {
            const datos = 'Información sensible';
            const resultado = await securityManager.encryptData(datos);
            
            expect(resultado).toHaveProperty('encrypted');
            expect(resultado).toHaveProperty('iv');
            expect(resultado).toHaveProperty('key');
            expect(resultado.encrypted).not.toBe(datos);
        });
    });

    describe('HTTPS Enforcement', () => {
        it('should enforce HTTPS when on HTTP', async () => {
            const originalLocation = window.location;
            delete window.location;
            window.location = {
                protocol: 'http:',
                host: 'example.com',
                pathname: '/test',
                href: ''
            };

            await securityManager.enforceHTTPS();
            expect(window.location.href).toBe('https://example.com/test');

            window.location = originalLocation;
        });

        it('should not redirect when already on HTTPS', async () => {
            const originalLocation = window.location;
            delete window.location;
            window.location = {
                protocol: 'https:',
                host: 'example.com',
                pathname: '/test',
                href: ''
            };

            const result = await securityManager.enforceHTTPS();
            expect(result).toBe(true);
            expect(window.location.href).toBe('');

            window.location = originalLocation;
        });
    });

    describe('Security Headers', () => {
        it('should set security headers correctly', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true
                })
            );

            const result = await securityManager.setSecurityHeaders();
            expect(result).toBe(true);
            expect(fetch).toHaveBeenCalledWith('/api/security-headers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(securityManager.secureHeaders)
            });
        });

        it('should handle errors when setting security headers', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: false
                })
            );

            const result = await securityManager.setSecurityHeaders();
            expect(result).toBe(false);
        });
    });

    describe('SSL Verification', () => {
        it('should verify SSL connection successfully', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true
                })
            );

            const result = await securityManager.checkSSL();
            expect(result).toBe(true);
        });

        it('should handle SSL verification errors', async () => {
            global.fetch = jest.fn(() =>
                Promise.reject(new Error('SSL Error'))
            );

            const result = await securityManager.checkSSL();
            expect(result).toBe(false);
        });
    });

    describe('Input Validation Edge Cases', () => {
        it('should handle very long inputs', () => {
            const longInput = 'a'.repeat(10000);
            expect(securityManager.sanitizeInput(longInput)).toHaveLength(1000);
        });

        it('should handle empty inputs', () => {
            expect(securityManager.sanitizeInput('')).toBe('');
            expect(securityManager.sanitizeInput(null)).toBe('');
            expect(securityManager.sanitizeInput(undefined)).toBe('');
        });

        it('should handle special characters in inputs', () => {
            const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            expect(securityManager.sanitizeInput(specialChars)).toBe(specialChars);
        });
    });

    describe('CSRF Protection', () => {
        it('should generate unique CSRF tokens', () => {
            const token1 = securityManager.generateCSRFToken();
            const token2 = securityManager.generateCSRFToken();
            expect(token1).not.toBe(token2);
        });

        it('should validate CSRF tokens correctly', () => {
            const token = securityManager.generateCSRFToken();
            expect(securityManager.validateCSRFToken(token)).toBe(true);
            expect(securityManager.validateCSRFToken('invalid-token')).toBe(false);
        });
    });

    describe('Password Security', () => {
        it('should enforce strong password requirements', () => {
            expect(securityManager.validatePassword('Password123!')).toBe(true);
            expect(securityManager.validatePassword('weak')).toBe(false);
            expect(securityManager.validatePassword('password')).toBe(false);
            expect(securityManager.validatePassword('PASSWORD')).toBe(false);
            expect(securityManager.validatePassword('12345678')).toBe(false);
        });

        it('should handle password hashing', async () => {
            const password = 'TestPassword123!';
            const hash = await securityManager.hashPassword(password);
            expect(hash).not.toBe(password);
            expect(hash).toMatch(/^\$2[aby]\$\d+\$/);
        });
    });
}); 