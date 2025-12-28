// ============================================
// USER ROUTES
// User profile, update, delete
// ============================================

const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// ============================================
// GET USER PROFILE
// GET /api/users/profile
// ============================================

router.get('/profile', async (req, res) => {
    try {
        const user = await db.getById('users', req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Remove password from response
        delete user.password;

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
});

// ============================================
// UPDATE USER PROFILE
// PUT /api/users/profile
// ============================================

router.put('/profile', async (req, res) => {
    try {
        const { name, phone, address, businessType } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;
        if (businessType) updateData.businessType = businessType;

        const updatedUser = await db.update('users', req.user.id, updateData);

        delete updatedUser.password;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
});

// ============================================
// DELETE USER ACCOUNT
// DELETE /api/users/profile
// ============================================

router.delete('/profile', async (req, res) => {
    try {
        await db.delete('users', req.user.id);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting account',
            error: error.message
        });
    }
});

// ============================================
// GET ALL USERS (Admin only)
// GET /api/users
// ============================================

router.get('/', authorize('admin'), async (req, res) => {
    try {
        const users = await db.getAll('users');

        // Remove passwords
        users.forEach(user => delete user.password);

        res.json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// ============================================
// GET SINGLE USER (Admin only)
// GET /api/users/:id
// ============================================

router.get('/:id', authorize('admin'), async (req, res) => {
    try {
        const user = await db.getById('users', req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        delete user.password;

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
});

// ============================================
// UPDATE USER (Admin only)
// PUT /api/users/:id
// ============================================

router.put('/:id', authorize('admin'), async (req, res) => {
    try {
        const { name, email, role, isActive } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (typeof isActive !== 'undefined') updateData.isActive = isActive;

        const updatedUser = await db.update('users', req.params.id, updateData);

        delete updatedUser.password;

        res.json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
});

// ============================================
// DELETE USER (Admin only)
// DELETE /api/users/:id
// ============================================

router.delete('/:id', authorize('admin'), async (req, res) => {
    try {
        await db.delete('users', req.params.id);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
});

module.exports = router;
