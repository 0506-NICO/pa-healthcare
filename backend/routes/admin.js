// ============================================
// ADMIN ROUTES
// P&A Institute of Integrative Medicine
// ============================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import database (Supabase)
let supabase;
try {
    supabase = require('../config/database').supabase;
} catch (error) {
    console.log('⚠️ Supabase not configured, using mock data');
}

// ============================================
// ADMIN AUTHENTICATION MIDDLEWARE
// ============================================
const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Check if admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }
        
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// ============================================
// ADMIN LOGIN
// ============================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        
        // Check for default admin (for initial setup)
        const defaultAdmins = [
            { email: 'admin@panda.com', password: 'admin123', name: 'Admin', role: 'admin' },
            { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, name: 'Super Admin', role: 'admin' }
        ];
        
        let admin = defaultAdmins.find(a => a.email === email && a.password === password);
        
        // If not default admin, check database
        if (!admin && supabase) {
            const { data, error } = await supabase
                .from('admins')
                .select('*')
                .eq('email', email)
                .single();
            
            if (data && await bcrypt.compare(password, data.password)) {
                admin = data;
            }
        }
        
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Generate token
        const token = jwt.sign(
            { id: admin.id || 'admin-1', email: admin.email, role: 'admin' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                admin: {
                    id: admin.id || 'admin-1',
                    name: admin.name,
                    email: admin.email,
                    role: 'admin'
                }
            }
        });
        
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});

// ============================================
// GET ALL APPOINTMENTS (Admin)
// ============================================
router.get('/appointments', adminAuth, async (req, res) => {
    try {
        let appointments = [];
        
        if (supabase) {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            appointments = data || [];
        }
        
        res.json({
            success: true,
            data: appointments,
            count: appointments.length
        });
        
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch appointments'
        });
    }
});

// ============================================
// UPDATE APPOINTMENT STATUS
// ============================================
router.put('/appointments/:id/status', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // Validate status
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        
        if (supabase) {
            const { data, error } = await supabase
                .from('appointments')
                .update({ 
                    status, 
                    updated_at: new Date().toISOString() 
                })
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            
            // Send email notification if status changed to confirmed
            if (status === 'confirmed' && data) {
                try {
                    const { sendEmail } = require('../services/email-service');
                    await sendEmail({
                        to: data.email,
                        template: 'appointment-confirmed',
                        data: {
                            fullName: data.fullName || data.full_name,
                            service: data.service,
                            date: data.date,
                            time: data.time
                        }
                    });
                } catch (emailError) {
                    console.error('Email notification failed:', emailError);
                }
            }
            
            res.json({
                success: true,
                message: `Appointment ${status} successfully`,
                data
            });
        } else {
            res.json({
                success: true,
                message: `Appointment ${status} successfully`,
                data: { id, status }
            });
        }
        
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update appointment'
        });
    }
});

// ============================================
// GET ALL USERS (Admin)
// ============================================
router.get('/users', adminAuth, async (req, res) => {
    try {
        let users = [];
        
        if (supabase) {
            const { data, error } = await supabase
                .from('users')
                .select('id, name, email, phone, created_at')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            users = data || [];
        }
        
        res.json({
            success: true,
            data: users,
            count: users.length
        });
        
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
});

// ============================================
// GET DASHBOARD STATS
// ============================================
router.get('/stats', adminAuth, async (req, res) => {
    try {
        let stats = {
            totalAppointments: 0,
            pendingAppointments: 0,
            confirmedAppointments: 0,
            completedAppointments: 0,
            cancelledAppointments: 0,
            totalUsers: 0,
            totalRevenue: 0,
            todayAppointments: 0,
            todayRevenue: 0
        };
        
        if (supabase) {
            // Get appointments
            const { data: appointments } = await supabase
                .from('appointments')
                .select('*');
            
            if (appointments) {
                stats.totalAppointments = appointments.length;
                stats.pendingAppointments = appointments.filter(a => a.status === 'pending').length;
                stats.confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
                stats.completedAppointments = appointments.filter(a => a.status === 'completed').length;
                stats.cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
                stats.totalRevenue = appointments
                    .filter(a => a.status === 'confirmed' || a.status === 'completed')
                    .reduce((sum, a) => sum + (a.amount || 0), 0);
                
                // Today's stats
                const today = new Date().toISOString().split('T')[0];
                const todayApts = appointments.filter(a => a.date?.startsWith(today));
                stats.todayAppointments = todayApts.length;
                stats.todayRevenue = todayApts.reduce((sum, a) => sum + (a.amount || 0), 0);
            }
            
            // Get users count
            const { count } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });
            
            stats.totalUsers = count || 0;
        }
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stats'
        });
    }
});

// ============================================
// GET PAYMENTS (Admin)
// ============================================
router.get('/payments', adminAuth, async (req, res) => {
    try {
        let payments = [];
        
        if (supabase) {
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (!error) {
                payments = data || [];
            }
        }
        
        res.json({
            success: true,
            data: payments,
            count: payments.length
        });
        
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payments'
        });
    }
});

// ============================================
// GET SERVICES (Admin)
// ============================================
router.get('/services', adminAuth, async (req, res) => {
    try {
        let services = [];
        
        if (supabase) {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .order('name');
            
            if (!error) {
                services = data || [];
            }
        }
        
        // Default services if none in database
        if (services.length === 0) {
            services = [
                { id: 1, name: 'General Consultation', price: 5000, category: 'General', duration: '30 mins', active: true },
                { id: 2, name: 'Laboratory Tests', price: 8000, category: 'Diagnostics', duration: '45 mins', active: true },
                { id: 3, name: 'Specialized Care', price: 15000, category: 'Specialist', duration: '60 mins', active: true },
                { id: 4, name: 'Emergency Care', price: 25000, category: 'Emergency', duration: 'Varies', active: true },
                { id: 5, name: 'Mental Health', price: 10000, category: 'Wellness', duration: '60 mins', active: true }
            ];
        }
        
        res.json({
            success: true,
            data: services
        });
        
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch services'
        });
    }
});

// ============================================
// ADD/UPDATE SERVICE
// ============================================
router.post('/services', adminAuth, async (req, res) => {
    try {
        const { name, price, category, duration } = req.body;
        
        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: 'Name and price are required'
            });
        }
        
        if (supabase) {
            const { data, error } = await supabase
                .from('services')
                .insert([{ name, price, category, duration, active: true }])
                .select()
                .single();
            
            if (error) throw error;
            
            res.json({
                success: true,
                message: 'Service added successfully',
                data
            });
        } else {
            res.json({
                success: true,
                message: 'Service added successfully',
                data: { name, price, category, duration }
            });
        }
        
    } catch (error) {
        console.error('Error adding service:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add service'
        });
    }
});

router.put('/services/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        if (supabase) {
            const { data, error } = await supabase
                .from('services')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            
            res.json({
                success: true,
                message: 'Service updated successfully',
                data
            });
        } else {
            res.json({
                success: true,
                message: 'Service updated successfully',
                data: { id, ...updates }
            });
        }
        
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update service'
        });
    }
});

router.delete('/services/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        if (supabase) {
            const { error } = await supabase
                .from('services')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
        }
        
        res.json({
            success: true,
            message: 'Service deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete service'
        });
    }
});

module.exports = router;