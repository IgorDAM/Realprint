describe('Auth Integration Tests', () => {
    let auth;

    beforeAll(() => {
        auth = new Auth();
    });

    describe('Login', () => {
        it('should login successfully with valid credentials', async () => {
            const result = await auth.login('test@example.com', 'password123');
            expect(result.success).toBe(true);
            expect(result.token).toBeDefined();
        });

        it('should fail with invalid credentials', async () => {
            try {
                await auth.login('invalid@example.com', 'wrongpassword');
                fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).toBe('Invalid credentials');
            }
        });

        it('should handle network errors', async () => {
            // Simular error de red
            jest.spyOn(global, 'fetch').mockImplementation(() => {
                throw new Error('Network error');
            });

            try {
                await auth.login('test@example.com', 'password123');
                fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).toBe('Network error');
            }

            // Restaurar fetch
            global.fetch.mockRestore();
        });
    });

    describe('Registration', () => {
        it('should register successfully with valid data', async () => {
            const userData = {
                nombre: 'Test',
                apellidos: 'User',
                email: 'newuser@example.com',
                password: 'password123',
                telefono: '123456789',
                direccion: 'Test Address',
                pais: 'Spain',
                ciudad: 'Madrid'
            };

            const result = await auth.register(userData);
            expect(result.success).toBe(true);
            expect(result.user).toBeDefined();
        });

        it('should fail with invalid data', async () => {
            const invalidData = {
                nombre: '',
                email: 'invalid-email',
                password: '123'
            };

            try {
                await auth.register(invalidData);
                fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).toBe('Invalid user data');
            }
        });

        it('should handle duplicate email', async () => {
            const duplicateData = {
                nombre: 'Test',
                apellidos: 'User',
                email: 'existing@example.com',
                password: 'password123',
                telefono: '123456789',
                direccion: 'Test Address',
                pais: 'Spain',
                ciudad: 'Madrid'
            };

            try {
                await auth.register(duplicateData);
                fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).toBe('Email already exists');
            }
        });
    });

    describe('Password Reset', () => {
        it('should send reset email successfully', async () => {
            const result = await auth.requestPasswordReset('test@example.com');
            expect(result.success).toBe(true);
            expect(result.message).toBe('Reset email sent');
        });

        it('should fail with non-existent email', async () => {
            try {
                await auth.requestPasswordReset('nonexistent@example.com');
                fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).toBe('Email not found');
            }
        });
    });

    describe('Session Management', () => {
        it('should maintain session after login', async () => {
            await auth.login('test@example.com', 'password123');
            expect(auth.isLoggedIn()).toBe(true);
            expect(auth.getCurrentUser()).toBeDefined();
        });

        it('should clear session after logout', async () => {
            await auth.logout();
            expect(auth.isLoggedIn()).toBe(false);
            expect(auth.getCurrentUser()).toBeNull();
        });

        it('should handle session expiration', async () => {
            // Simular expiración de token
            jest.spyOn(auth, 'isTokenExpired').mockReturnValue(true);

            try {
                await auth.getCurrentUser();
                fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).toBe('Session expired');
            }

            auth.isTokenExpired.mockRestore();
        });
    });

    describe('Security', () => {
        it('should encrypt sensitive data', async () => {
            const sensitiveData = 'password123';
            const encrypted = auth.encryptData(sensitiveData);
            expect(encrypted).not.toBe(sensitiveData);
            expect(auth.decryptData(encrypted)).toBe(sensitiveData);
        });

        it('should prevent XSS attacks', async () => {
            const maliciousInput = '<script>alert("xss")</script>';
            const sanitized = auth.sanitizeInput(maliciousInput);
            expect(sanitized).not.toContain('<script>');
        });

        it('should validate CSRF tokens', async () => {
            const validToken = auth.generateCSRFToken();
            expect(auth.validateCSRFToken(validToken)).toBe(true);

            const invalidToken = 'invalid-token';
            expect(auth.validateCSRFToken(invalidToken)).toBe(false);
        });
    });
}); 