// ============================================
// APPLICATION CONSTANTS
// ============================================

// HTTP Status Codes
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

// User Roles
const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
};

// Appointment Status
const APPOINTMENT_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show'
};

// Payment Status
const PAYMENT_STATUS = {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
    REFUNDED: 'refunded'
};

// Order Status
const ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

// Service Types
const SERVICES = {
    GENERAL_CONSULTATION: 'General Consultation',
    SPECIALIST_CONSULTATION: 'Specialist Consultation',
    LAB_TEST: 'Laboratory Test',
    IMAGING: 'Imaging/Radiology',
    DENTAL: 'Dental Care',
    VACCINATION: 'Vaccination',
    HEALTH_CHECKUP: 'Health Checkup'
};

// Service Prices (in Naira)
const SERVICE_PRICES = {
    'General Consultation': 5000,
    'Specialist Consultation': 10000,
    'Laboratory Test': 3000,
    'Imaging/Radiology': 8000,
    'Dental Care': 7000,
    'Vaccination': 2000,
    'Health Checkup': 15000
};

// Time Slots
const TIME_SLOTS = [
    '08:00 AM',
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM'
];

// Email Templates
const EMAIL_TEMPLATES = {
    WELCOME: 'welcome',
    PASSWORD_RESET: 'password-reset',
    PASSWORD_CHANGED: 'password-changed',
    APPOINTMENT_CONFIRMATION: 'appointment-confirmation',
    APPOINTMENT_REMINDER: 'appointment-reminder',
    PAYMENT_RECEIPT: 'payment-receipt',
    ORDER_CONFIRMATION: 'order-confirmation'
};

// Error Messages
const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'Email already registered',
    USER_NOT_FOUND: 'User not found',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    TOKEN_EXPIRED: 'Token has expired',
    INVALID_TOKEN: 'Invalid token',
    ACCOUNT_LOCKED: 'Account temporarily locked',
    VALIDATION_ERROR: 'Validation failed',
    SERVER_ERROR: 'Internal server error',
    NOT_FOUND: 'Resource not found'
};

// Success Messages
const SUCCESS_MESSAGES = {
    USER_CREATED: 'User created successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logged out successfully',
    PASSWORD_RESET_SENT: 'Password reset link sent',
    PASSWORD_CHANGED: 'Password changed successfully',
    APPOINTMENT_CREATED: 'Appointment booked successfully',
    APPOINTMENT_UPDATED: 'Appointment updated successfully',
    PAYMENT_SUCCESS: 'Payment successful',
    ORDER_CREATED: 'Order placed successfully'
};

// Regex Patterns
const REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[+]?[\d\s()-]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/
};

// Pagination
const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
};

// Rate Limiting
const RATE_LIMITS = {
    GENERAL: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 100
    },
    AUTH: {
        WINDOW_MS: 15 * 60 * 1000,
        MAX_REQUESTS: 5
    },
    PAYMENT: {
        WINDOW_MS: 60 * 60 * 1000, // 1 hour
        MAX_REQUESTS: 10
    }
};

// File Upload
const FILE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    UPLOAD_PATH: './uploads/'
};

// Currency
const CURRENCY = {
    CODE: 'NGN',
    SYMBOL: '₦',
    NAME: 'Nigerian Naira'
};

// Date Formats
const DATE_FORMATS = {
    DATE_ONLY: 'YYYY-MM-DD',
    TIME_ONLY: 'HH:mm:ss',
    DATETIME: 'YYYY-MM-DD HH:mm:ss',
    READABLE: 'DD MMM YYYY'
};

module.exports = {
    HTTP_STATUS,
    USER_ROLES,
    APPOINTMENT_STATUS,
    PAYMENT_STATUS,
    ORDER_STATUS,
    SERVICES,
    SERVICE_PRICES,
    TIME_SLOTS,
    EMAIL_TEMPLATES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    REGEX,
    PAGINATION,
    RATE_LIMITS,
    FILE_UPLOAD,
    CURRENCY,
    DATE_FORMATS
};
