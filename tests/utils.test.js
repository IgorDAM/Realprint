import { expect } from 'chai';
import {
    formatCurrency,
    formatDate,
    debounce,
    throttle,
    showLoading,
    hideLoading,
    showNotification,
    handleApiError
} from '../js/utils.js';

describe('Utility Functions', () => {
    describe('formatCurrency', () => {
        it('should format numbers as currency', () => {
            expect(formatCurrency(1000)).to.equal('1.000,00 €');
            expect(formatCurrency(1234.56)).to.equal('1.234,56 €');
            expect(formatCurrency(0)).to.equal('0,00 €');
            expect(formatCurrency(-1000)).to.equal('-1.000,00 €');
        });

        it('should handle different locales', () => {
            expect(formatCurrency(1000, 'en-US')).to.equal('$1,000.00');
            expect(formatCurrency(1000, 'de-DE')).to.equal('1.000,00 €');
        });
    });

    describe('formatDate', () => {
        it('should format dates correctly', () => {
            const date = new Date('2024-03-15');
            expect(formatDate(date)).to.equal('15/03/2024');
            expect(formatDate(date, 'en-US')).to.equal('3/15/2024');
            expect(formatDate(date, 'de-DE')).to.equal('15.3.2024');
        });

        it('should handle invalid dates', () => {
            expect(formatDate('invalid')).to.equal('Invalid Date');
        });
    });

    describe('debounce', () => {
        it('should delay function execution', (done) => {
            let count = 0;
            const debounced = debounce(() => count++, 100);
            
            debounced();
            debounced();
            debounced();
            
            expect(count).to.equal(0);
            
            setTimeout(() => {
                expect(count).to.equal(1);
                done();
            }, 150);
        });
    });

    describe('throttle', () => {
        it('should limit function execution rate', (done) => {
            let count = 0;
            const throttled = throttle(() => count++, 100);
            
            throttled();
            throttled();
            throttled();
            
            expect(count).to.equal(1);
            
            setTimeout(() => {
                throttled();
                expect(count).to.equal(2);
                done();
            }, 150);
        });
    });

    describe('Loading Functions', () => {
        beforeEach(() => {
            document.body.innerHTML = '';
        });

        it('should show and hide loading overlay', () => {
            showLoading();
            expect(document.querySelector('.loading-overlay')).to.exist;
            
            hideLoading();
            expect(document.querySelector('.loading-overlay')).to.not.exist;
        });
    });

    describe('Notification Functions', () => {
        beforeEach(() => {
            document.body.innerHTML = '';
        });

        it('should show notifications', () => {
            showNotification('Test message', 'success');
            const notification = document.querySelector('.notification');
            expect(notification).to.exist;
            expect(notification.textContent).to.include('Test message');
            expect(notification.classList.contains('success')).to.be.true;
        });

        it('should auto-remove notifications', (done) => {
            showNotification('Test message', 'success', 100);
            setTimeout(() => {
                expect(document.querySelector('.notification')).to.not.exist;
                done();
            }, 150);
        });
    });

    describe('UI Utilities', () => {
        it('should handle API errors', () => {
            const mockBody = document.createElement('div');
            document.body = mockBody;

            const error = {
                response: {
                    status: 404,
                    data: { message: 'Not found' }
                }
            };

            handleApiError(error);
            const notification = document.body.querySelector('.notification');
            expect(notification).to.exist;
            expect(notification.classList.contains('error')).to.be.true;
            expect(notification.textContent).to.include('Not found');
        });
    });
}); 