import { expect } from 'chai';
import {
    generateCsrfToken,
    verifyCsrfToken,
    verifyRecaptcha,
    checkPasswordStrength,
    generateEmailVerificationToken,
    verifyEmailToken,
    sanitizeString,
    isSecureUrl
} from '../js/security.js';

describe('Security Functions', () => {
    describe('CSRF Token', () => {
        it('should generate a valid CSRF token', async () => {
            const token = await generateCsrfToken();
            expect(token).to.be.a('string');
            expect(token.length).to.be.greaterThan(0);
        });

        it('should verify a valid CSRF token', async () => {
            const token = await generateCsrfToken();
            const isValid = await verifyCsrfToken(token);
            expect(isValid).to.be.true;
        });

        it('should reject an invalid CSRF token', async () => {
            const isValid = await verifyCsrfToken('invalid_token');
            expect(isValid).to.be.false;
        });
    });

    describe('Password Strength', () => {
        it('should validate a strong password', () => {
            const password = 'StrongPass123!';
            const strength = checkPasswordStrength(password);
            expect(strength.meetsRequirements).to.be.true;
            expect(strength.isStrong).to.be.true;
        });

        it('should reject a weak password', () => {
            const password = 'weak';
            const strength = checkPasswordStrength(password);
            expect(strength.meetsRequirements).to.be.false;
            expect(strength.isStrong).to.be.false;
        });

        it('should check all password requirements', () => {
            const password = 'Test123!';
            const strength = checkPasswordStrength(password);
            expect(strength.length).to.be.true;
            expect(strength.upperCase).to.be.true;
            expect(strength.lowerCase).to.be.true;
            expect(strength.numbers).to.be.true;
            expect(strength.specialChar).to.be.true;
        });
    });

    describe('Email Verification', () => {
        it('should generate a valid email verification token', () => {
            const token = generateEmailVerificationToken();
            expect(token).to.be.a('string');
            expect(token).to.match(/^\d+:[a-zA-Z0-9]+$/);
        });

        it('should verify a valid email token', () => {
            const token = generateEmailVerificationToken();
            const isValid = verifyEmailToken(token);
            expect(isValid).to.be.true;
        });

        it('should reject an expired email token', () => {
            const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 horas
            const token = `${oldTimestamp}:random`;
            const isValid = verifyEmailToken(token);
            expect(isValid).to.be.false;
        });
    });

    describe('String Sanitization', () => {
        it('should sanitize HTML tags', () => {
            const input = '<script>alert("xss")</script>';
            const sanitized = sanitizeString(input);
            expect(sanitized).to.not.include('<script>');
            expect(sanitized).to.include('&lt;script&gt;');
        });

        it('should sanitize special characters', () => {
            const input = '"\'<>';
            const sanitized = sanitizeString(input);
            expect(sanitized).to.equal('&quot;&#039;&lt;&gt;');
        });

        it('should handle empty strings', () => {
            const input = '';
            const sanitized = sanitizeString(input);
            expect(sanitized).to.equal('');
        });
    });

    describe('URL Security', () => {
        it('should validate secure URLs', () => {
            const url = 'https://example.com';
            const isSecure = isSecureUrl(url);
            expect(isSecure).to.be.true;
        });

        it('should reject insecure URLs', () => {
            const url = 'http://example.com';
            const isSecure = isSecureUrl(url);
            expect(isSecure).to.be.false;
        });

        it('should handle invalid URLs', () => {
            const url = 'not-a-url';
            const isSecure = isSecureUrl(url);
            expect(isSecure).to.be.false;
        });
    });
}); 