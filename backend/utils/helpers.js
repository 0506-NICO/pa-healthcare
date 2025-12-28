// ============================================
// UTILITY FUNCTIONS
// Reusable helper functions
// ============================================

/**
 * Format currency (Nigerian Naira)
 * @param {number} amount - Amount in kobo
 * @returns {string} Formatted currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    }).format(amount / 100);
}

/**
 * Generate random string
 * @param {number} length - Length of string
 * @returns {string} Random string
 */
function generateRandomString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Valid or not
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate phone number
 * @param {string} phone - Phone number
 * @returns {boolean} Valid or not
 */
function isValidPhone(phone) {
    const re = /^[+]?[\d\s()-]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Sanitize string (remove dangerous characters)
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
    return str
        .replace(/[<>]/g, '')
        .trim();
}

/**
 * Calculate pagination
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} Pagination data
 */
function getPagination(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return {
        limit: parseInt(limit),
        offset: parseInt(offset),
        page: parseInt(page)
    };
}

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @returns {string} Formatted date
 */
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

/**
 * Check if date is in the past
 * @param {string} dateStr - Date string
 * @returns {boolean} Is past
 */
function isPastDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

/**
 * Generate reference code
 * @param {string} prefix - Prefix for reference
 * @returns {string} Reference code
 */
function generateReference(prefix = 'REF') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}_${timestamp}_${random}`;
}

/**
 * Calculate percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @returns {number} Percentage
 */
function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @returns {string} Truncated text
 */
function truncateText(text, length = 100) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

/**
 * Sleep/Delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise} Result of function
 */
async function retryWithBackoff(fn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await sleep(Math.pow(2, i) * 1000); // Exponential backoff
        }
    }
}

module.exports = {
    formatCurrency,
    generateRandomString,
    isValidEmail,
    isValidPhone,
    sanitizeString,
    getPagination,
    formatDate,
    isPastDate,
    generateReference,
    calculatePercentage,
    truncateText,
    sleep,
    retryWithBackoff
};
