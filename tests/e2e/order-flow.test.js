describe('Order Flow E2E Tests', () => {
    let page;

    beforeAll(async () => {
        page = await browser.newPage();
        await page.goto('http://localhost:3000');
    });

    afterAll(async () => {
        await page.close();
    });

    describe('Login Flow', () => {
        it('should login successfully', async () => {
            await page.click('a[href="login.html"]');
            await page.waitForSelector('#loginForm');

            await page.type('#email', 'test@example.com');
            await page.type('#password', 'password123');
            await page.click('button[type="submit"]');

            await page.waitForNavigation();
            expect(page.url()).toContain('dashboard.html');
        });
    });

    describe('Order Creation', () => {
        it('should create a new order', async () => {
            await page.click('a[href="pedido.html"]');
            await page.waitForSelector('#orderForm');

            // Información personal
            await page.type('#nombre', 'Test User');
            await page.type('#apellidos', 'Test Surname');
            await page.type('#email', 'test@example.com');
            await page.type('#telefono', '123456789');

            // Detalles del pedido
            await page.select('#tipo_servicio', 'serigrafia');
            await page.type('#descripcion', 'Test order description');
            await page.type('#cantidad', '10');
            await page.type('#fechaEntrega', '2024-12-31');

            // Archivos
            const fileInput = await page.$('#archivos');
            await fileInput.uploadFile('tests/fixtures/test-design.png');

            // Términos y condiciones
            await page.click('#terminos');

            // Enviar pedido
            await page.click('button[type="submit"]');

            // Verificar redirección y mensaje de éxito
            await page.waitForNavigation();
            expect(page.url()).toContain('confirmacion.html');
            const successMessage = await page.$eval('.alert-success', el => el.textContent);
            expect(successMessage).toContain('Pedido enviado con éxito');
        });
    });

    describe('Order Tracking', () => {
        it('should track order status', async () => {
            await page.click('a[href="mis-pedidos.html"]');
            await page.waitForSelector('.order-list');

            const orderStatus = await page.$eval('.order-status', el => el.textContent);
            expect(orderStatus).toBe('En proceso');
        });

        it('should update order status', async () => {
            // Simular actualización de estado
            await page.evaluate(() => {
                window.monitor.trackOrderStatus('completado');
            });

            await page.reload();
            const updatedStatus = await page.$eval('.order-status', el => el.textContent);
            expect(updatedStatus).toBe('Completado');
        });
    });

    describe('Order Management', () => {
        it('should cancel an order', async () => {
            await page.click('.cancel-order');
            await page.waitForSelector('.confirmation-dialog');

            await page.click('.confirm-cancel');
            await page.waitForNavigation();

            const status = await page.$eval('.order-status', el => el.textContent);
            expect(status).toBe('Cancelado');
        });

        it('should handle payment processing', async () => {
            await page.click('.pay-order');
            await page.waitForSelector('#paymentForm');

            // Simular datos de pago
            await page.type('#cardNumber', '4111111111111111');
            await page.type('#expiryDate', '12/25');
            await page.type('#cvv', '123');
            await page.click('button[type="submit"]');

            // Verificar procesamiento exitoso
            await page.waitForNavigation();
            const paymentStatus = await page.$eval('.payment-status', el => el.textContent);
            expect(paymentStatus).toBe('Pago procesado con éxito');
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid order data', async () => {
            await page.click('a[href="pedido.html"]');
            await page.waitForSelector('#orderForm');

            // Intentar enviar formulario vacío
            await page.click('button[type="submit"]');

            const errorMessage = await page.$eval('.alert-danger', el => el.textContent);
            expect(errorMessage).toContain('Por favor complete todos los campos requeridos');
        });

        it('should handle file upload errors', async () => {
            const fileInput = await page.$('#archivos');
            await fileInput.uploadFile('tests/fixtures/invalid-file.exe');

            const errorMessage = await page.$eval('.file-error', el => el.textContent);
            expect(errorMessage).toContain('Formato de archivo no válido');
        });
    });

    describe('Performance', () => {
        it('should load order page within 2 seconds', async () => {
            const startTime = Date.now();
            await page.goto('http://localhost:3000/pedido.html');
            const loadTime = Date.now() - startTime;

            expect(loadTime).toBeLessThan(2000);
        });

        it('should handle multiple concurrent orders', async () => {
            // Simular múltiples pedidos simultáneos
            const orderPromises = Array(5).fill().map(async () => {
                const newPage = await browser.newPage();
                await newPage.goto('http://localhost:3000/pedido.html');
                await newPage.close();
            });

            await Promise.all(orderPromises);
            // Verificar que el sistema sigue respondiendo
            await page.goto('http://localhost:3000');
            const responseTime = await page.evaluate(() => performance.now());
            expect(responseTime).toBeLessThan(1000);
        });
    });
}); 