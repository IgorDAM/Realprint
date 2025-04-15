import { expect } from 'chai';
import { validators } from '../src/utils/utils.js';

describe('Validators', () => {
    describe('email', () => {
        it('should validate correct email format', () => {
            expect(validators.email('test@example.com')).to.be.true;
            expect(validators.email('user.name@domain.co.uk')).to.be.true;
            expect(validators.email('user+tag@example.com')).to.be.true;
        });

        it('should reject invalid email format', () => {
            expect(validators.email('test@')).to.be.false;
            expect(validators.email('@example.com')).to.be.false;
            expect(validators.email('test@example')).to.be.false;
            expect(validators.email('test@.com')).to.be.false;
            expect(validators.email('test@example..com')).to.be.false;
        });
    });

    describe('password', () => {
        it('should validate correct password format', () => {
            expect(validators.password('Password123')).to.be.true;
            expect(validators.password('Test1234')).to.be.true;
            expect(validators.password('Abcdefg1')).to.be.true;
        });

        it('should reject invalid password format', () => {
            expect(validators.password('pass')).to.be.false; // Too short
            expect(validators.password('password')).to.be.false; // No uppercase
            expect(validators.password('PASSWORD')).to.be.false; // No lowercase
            expect(validators.password('Password')).to.be.false; // No number
            expect(validators.password('12345678')).to.be.false; // No letter
        });
    });

    describe('phone', () => {
        it('should validate correct phone format', () => {
            expect(validators.phone('123456789')).to.be.true;
            expect(validators.phone('987654321')).to.be.true;
        });

        it('should reject invalid phone format', () => {
            expect(validators.phone('12345678')).to.be.false; // Too short
            expect(validators.phone('1234567890')).to.be.false; // Too long
            expect(validators.phone('12345678a')).to.be.false; // Contains letter
            expect(validators.phone('123-456-789')).to.be.false; // Contains hyphen
        });
    });

    describe('date', () => {
        it('should validate correct date format', () => {
            expect(validators.date('2024-03-15')).to.be.true;
            expect(validators.date('2024/03/15')).to.be.true;
            expect(validators.date('15-03-2024')).to.be.true;
        });

        it('should reject invalid date format', () => {
            expect(validators.date('2024-13-15')).to.be.false; // Invalid month
            expect(validators.date('2024-03-32')).to.be.false; // Invalid day
            expect(validators.date('not-a-date')).to.be.false; // Not a date
            expect(validators.date('2024/03/15/extra')).to.be.false; // Extra parts
        });
    });

    describe('url', () => {
        it('should validate correct URL format', () => {
            expect(validators.url('https://example.com')).to.be.true;
            expect(validators.url('http://example.com')).to.be.true;
            expect(validators.url('https://example.com/path')).to.be.true;
            expect(validators.url('https://example.com?query=param')).to.be.true;
        });

        it('should reject invalid URL format', () => {
            expect(validators.url('example.com')).to.be.false; // Missing protocol
            expect(validators.url('https://')).to.be.false; // Missing domain
            expect(validators.url('not-a-url')).to.be.false; // Not a URL
            expect(validators.url('https://example..com')).to.be.false; // Invalid domain
        });
    });

    describe('file', () => {
        it('should validate correct file', () => {
            const validFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
            expect(validators.file(validFile)).to.be.true;
        });

        it('should reject invalid file', () => {
            const tooLargeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
            expect(validators.file(tooLargeFile)).to.be.false;

            const invalidTypeFile = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
            expect(validators.file(invalidTypeFile)).to.be.false;
        });
    });
}); 