import { expect } from 'chai';
import { validators, errorMessages } from '../src/utils/utils.js';

describe('Form Validation', () => {
    describe('Email Validation', () => {
        it('should validate correct email format', () => {
            expect(validators.email('test@example.com')).to.be.true;
            expect(validators.email('user.name@domain.co.uk')).to.be.true;
        });

        it('should reject invalid email formats', () => {
            expect(validators.email('invalid-email')).to.be.false;
            expect(validators.email('test@')).to.be.false;
            expect(validators.email('@domain.com')).to.be.false;
        });
    });

    describe('Password Validation', () => {
        it('should validate strong passwords', () => {
            expect(validators.password('Password123')).to.be.true;
            expect(validators.password('Test@1234')).to.be.true;
        });

        it('should reject weak passwords', () => {
            expect(validators.password('weak')).to.be.false;
            expect(validators.password('password')).to.be.false;
            expect(validators.password('12345678')).to.be.false;
            expect(validators.password('PASSWORD')).to.be.false;
        });
    });

    describe('Phone Validation', () => {
        it('should validate correct phone numbers', () => {
            expect(validators.phone('123456789')).to.be.true;
            expect(validators.phone('987654321')).to.be.true;
        });

        it('should reject invalid phone numbers', () => {
            expect(validators.phone('12345')).to.be.false;
            expect(validators.phone('1234567890')).to.be.false;
            expect(validators.phone('abc123456')).to.be.false;
        });
    });

    describe('File Validation', () => {
        it('should validate allowed file types', () => {
            const validFile = new File([''], 'test.pdf', { type: 'application/pdf' });
            expect(validators.file(validFile)).to.be.true;
        });

        it('should reject disallowed file types', () => {
            const invalidFile = new File([''], 'test.exe', { type: 'application/x-msdownload' });
            expect(validators.file(invalidFile)).to.be.false;
        });

        it('should validate file size', () => {
            const largeFile = new File(['x'.repeat(1024 * 1024 * 6)], 'large.pdf', { type: 'application/pdf' });
            expect(validators.file(largeFile)).to.be.false;
        });
    });

    describe('Date Validation', () => {
        it('should validate correct date formats', () => {
            expect(validators.date('2024-01-01')).to.be.true;
            expect(validators.date('01/01/2024')).to.be.true;
        });

        it('should reject invalid dates', () => {
            expect(validators.date('invalid-date')).to.be.false;
            expect(validators.date('2024-13-01')).to.be.false;
        });
    });

    describe('URL Validation', () => {
        it('should validate correct URLs', () => {
            expect(validators.url('https://example.com')).to.be.true;
            expect(validators.url('http://test.com/path')).to.be.true;
        });

        it('should reject invalid URLs', () => {
            expect(validators.url('not-a-url')).to.be.false;
            expect(validators.url('ftp://example.com')).to.be.false;
        });
    });

    describe('Error Messages', () => {
        it('should return correct error messages', () => {
            expect(errorMessages.required).to.equal('Este campo es obligatorio');
            expect(errorMessages.email).to.equal('Por favor, introduce un email válido');
            expect(errorMessages.password).to.equal('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
            expect(errorMessages.phone).to.equal('Por favor, introduce un número de teléfono válido de 9 dígitos');
            expect(errorMessages.file).to.equal('Tipo de archivo no permitido o tamaño excesivo');
            expect(errorMessages.date).to.equal('Por favor, introduce una fecha válida');
            expect(errorMessages.url).to.equal('Por favor, introduce una URL válida');
        });
    });
}); 