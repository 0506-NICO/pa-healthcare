// ============================================
// PRODUCT ROUTES (For E-commerce)
// Optional - only used for e-commerce sites
// ============================================

const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

// ============================================
// GET ALL PRODUCTS
// GET /api/products
// ============================================

router.get('/', optionalAuth, async (req, res) => {
    try {
        const { category, minPrice, maxPrice, search } = req.query;

        let products = await db.getAll('products');

        // Filter by category
        if (category) {
            products = products.filter(p => p.category === category);
        }

        // Filter by price range
        if (minPrice) {
            products = products.filter(p => p.price >= parseFloat(minPrice));
        }
        if (maxPrice) {
            products = products.filter(p => p.price <= parseFloat(maxPrice));
        }

        // Search
        if (search) {
            const searchLower = search.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower)
            );
        }

        res.json({
            success: true,
            count: products.length,
            data: products
        });

    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
});

// ============================================
// GET SINGLE PRODUCT
// GET /api/products/:id
// ============================================

router.get('/:id', async (req, res) => {
    try {
        const product = await db.getById('products', req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
});

// ============================================
// CREATE PRODUCT (Admin only)
// POST /api/products
// ============================================

router.post('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { name, description, price, category, stock, images } = req.body;

        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: 'Name and price are required'
            });
        }

        const product = await db.create('products', {
            name,
            description: description || '',
            price: parseFloat(price),
            category: category || 'General',
            stock: stock || 0,
            images: images || [],
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });

    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
});

// ============================================
// UPDATE PRODUCT (Admin only)
// PUT /api/products/:id
// ============================================

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { name, description, price, category, stock, isActive } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (price) updateData.price = parseFloat(price);
        if (category) updateData.category = category;
        if (stock !== undefined) updateData.stock = stock;
        if (isActive !== undefined) updateData.isActive = isActive;

        const product = await db.update('products', req.params.id, updateData);

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });

    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
});

// ============================================
// DELETE PRODUCT (Admin only)
// DELETE /api/products/:id
// ============================================

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        await db.delete('products', req.params.id);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
});

module.exports = router;
