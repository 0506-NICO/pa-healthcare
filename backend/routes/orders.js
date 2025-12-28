// ============================================
// ORDER ROUTES (For E-commerce)
// Optional - only used for e-commerce sites
// ============================================

const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { sendEmail } = require('../services/email-service');

// ============================================
// CREATE ORDER
// POST /api/orders
// ============================================

router.post('/', authenticate, async (req, res) => {
    try {
        const { items, shippingAddress, total } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item'
            });
        }

        const order = await db.create('orders', {
            userId: req.user.id,
            items,
            shippingAddress,
            total: parseFloat(total),
            status: 'pending', // pending, processing, shipped, delivered, cancelled
            paymentStatus: 'unpaid'
        });

        // Send order confirmation email
        await sendEmail({
            to: req.user.email,
            template: 'order-confirmation',
            data: {
                name: req.user.name,
                orderId: order.id,
                total,
                items
            }
        });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
});

// ============================================
// GET USER ORDERS
// GET /api/orders/my-orders
// ============================================

router.get('/my-orders', authenticate, async (req, res) => {
    try {
        const orders = await db.getAll('orders', { userId: req.user.id });

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

// ============================================
// GET ALL ORDERS (Admin)
// GET /api/orders
// ============================================

router.get('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { status } = req.query;
        const filters = status ? { status } : {};

        const orders = await db.getAll('orders', filters);

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

// ============================================
// GET SINGLE ORDER
// GET /api/orders/:id
// ============================================

router.get('/:id', authenticate, async (req, res) => {
    try {
        const order = await db.getById('orders', req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization
        if (req.user.role !== 'admin' && order.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
});

// ============================================
// UPDATE ORDER STATUS (Admin)
// PUT /api/orders/:id/status
// ============================================

router.put('/:id/status', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const order = await db.update('orders', req.params.id, { status });

        res.json({
            success: true,
            message: 'Order status updated',
            data: order
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
});

module.exports = router;
