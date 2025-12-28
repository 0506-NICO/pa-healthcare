// ============================================
// AUTHENTICATION MIDDLEWARE
// Protect routes and verify JWT tokens
// ============================================

const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

// ============================================
// AUTHENTICATE USER
// Verify JWT token and attach user to request
// ============================================

async function authenticate(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Please login.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await db.getById('users', decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is disabled'
            });
        }

        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        };

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
}

// ============================================
// AUTHORIZE ROLE
// Check if user has required role
// ============================================

function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this resource'
            });
        }

        next();
    };
}

// ============================================
// OPTIONAL AUTHENTICATION
// Attach user if token exists, but don't require it
// ============================================

async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await db.getById('users', decoded.id);

            if (user && user.isActive) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name: user.name
                };
            }
        }

        next();

    } catch (error) {
        // Continue without user
        next();
    }
}

module.exports = {
    authenticate,
    authorize,
    optionalAuth
};
