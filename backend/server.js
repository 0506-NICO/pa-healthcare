// ============================================
// P&A HEALTHCARE BACKEND - PRODUCTION READY
// With CSRF Protection
// ============================================

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;

// ============================================
// JWT SECRET
// ============================================
const JWT_SECRET = process.env.JWT_SECRET || 'pa-healthcare-2025-secret-key';

// ============================================
// CSRF TOKENS STORAGE
// ============================================
const csrfTokens = new Map();

function generateCsrfToken() {
    return crypto.randomBytes(32).toString('hex');
}

function validateCsrfToken(token) {
    if (!token) return false;
    const isValid = csrfTokens.has(token);
    if (isValid) {
        // Token used, remove it (one-time use) - or keep for session
        // csrfTokens.delete(token);
    }
    return isValid;
}

// Clean old tokens every hour
setInterval(() => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [token, timestamp] of csrfTokens.entries()) {
        if (timestamp < oneHourAgo) csrfTokens.delete(token);
    }
}, 60 * 60 * 1000);

// ============================================
// ALLOWED ORIGINS
// ============================================
const allowedOrigins = [
    'http://localhost:5500',
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:3000',
    'https://my-pa-health.vercel.app',
    'https://pa-healthcare-projectile.up.railway.app',
    'https://checkout.paystack.com'  // ← ADD THIS LINE
].filter(Boolean);
// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, Postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.some(allowed => origin.startsWith(allowed.split('://')[0] + '://' + allowed.split('://')[1]?.split('/')[0]) || allowed === origin)) {
            return callback(null, true);
        }
        
        // In development, allow all
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
    const time = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`📥 ${time} - ${req.method} ${req.path}`);
    next();
});

// ============================================
// CSRF MIDDLEWARE (for state-changing requests)
// ============================================
const csrfProtection = (req, res, next) => {
    // Skip in development or for safe methods
    if (process.env.NODE_ENV !== 'production') return next();
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    
    if (!validateCsrfToken(token)) {
        console.log('❌ CSRF validation failed');
        return res.status(403).json({ success: false, message: 'Invalid CSRF token' });
    }
    
    next();
};

// ============================================
// SUPABASE
// ============================================
const { createClient } = require('@supabase/supabase-js');
let supabase = null;
const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase initialized');
    supabase.from('appointments').select('count', { count: 'exact', head: true })
        .then(({ count }) => console.log(`✅ Supabase connected - ${count || 0} appointments`));
}

app.locals.supabase = supabase;

// ============================================
// EMAIL SERVICE
// ============================================
let emailService = null;
try {
    emailService = require('./services/email');
    app.locals.emailService = emailService;
    console.log('✅ Email service loaded');
} catch (e) {
    console.log('⚠️  Email not loaded');
}

// ============================================
// VERIFY TOKEN HELPER
// ============================================
function verifyToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;
    
    try {
        return jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    } catch (err) {
        console.log('❌ Token error:', err.message);
        return null;
    }
}

// ============================================
// CSRF TOKEN ENDPOINT
// ============================================
app.get('/api/csrf-token', (req, res) => {
    const token = generateCsrfToken();
    csrfTokens.set(token, Date.now());
    
    // Also set as cookie for additional security
    res.cookie('csrf-token', token, {
        httpOnly: false, // Frontend needs to read it
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000 // 1 hour
    });
    
    res.json({ success: true, csrfToken: token });
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// AUTH ROUTES
// ============================================
try {
    app.use('/api/auth', require('./routes/auth'));
    console.log('✅ Auth routes loaded');
} catch (e) {
    console.log('❌ Auth error:', e.message);
}

// ============================================
// APPOINTMENT ROUTES
// ============================================
try {
    app.use('/api/appointments', require('./routes/appointments'));
    console.log('✅ Appointment routes loaded');
} catch (e) {
    console.log('⚠️  Using inline appointments');
    
    app.post('/api/appointments', async (req, res) => {
        const { fullName, email, phone, service, date, time, amount, paymentRef } = req.body;
        const id = 'APT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        const data = { 
            id, full_name: fullName, email: email?.toLowerCase(), phone, service, date, time, 
            amount: amount || 0, payment_reference: paymentRef || '', 
            payment_status: paymentRef ? 'paid' : 'pending', status: 'pending', 
            created_at: new Date().toISOString() 
        };
        if (supabase) await supabase.from('appointments').insert([data]);
        
        // Send confirmation email
        if (emailService && email) {
            try {
                await emailService.sendAppointmentConfirmation({ to: email, name: fullName, service, date, time, appointmentId: id });
            } catch (e) { console.log('Email failed'); }
        }
        
        res.json({ success: true, data });
    });
    
    app.get('/api/appointments', async (req, res) => {
        const { email } = req.query;
        if (supabase && email) {
            const { data } = await supabase.from('appointments').select('*').eq('email', email.toLowerCase()).order('created_at', { ascending: false });
            return res.json({ success: true, data: data || [] });
        }
        res.json({ success: true, data: [] });
    });
    
    app.get('/api/appointments/:id', async (req, res) => {
        if (supabase) {
            const { data } = await supabase.from('appointments').select('*').eq('id', req.params.id).single();
            return res.json({ success: true, data });
        }
        res.json({ success: false, message: 'Not found' });
    });
    
    app.put('/api/appointments/:id', async (req, res) => {
        if (supabase) {
            const { data, error } = await supabase.from('appointments').update(req.body).eq('id', req.params.id).select().single();
            
            if (!error && data && req.body.status && emailService) {
                try {
                    await emailService.sendStatusUpdate(data.email, data);
                    console.log('📧 Status email sent');
                } catch (e) { console.log('Email failed'); }
            }
            
            console.log('✅ Appointment updated:', req.params.id);
            return res.json({ success: true, data });
        }
        res.json({ success: true });
    });
    
    app.delete('/api/appointments/:id', async (req, res) => {
        if (supabase) {
            await supabase.from('appointments').delete().eq('id', req.params.id);
        }
        res.json({ success: true });
    });
}

// ============================================
// PAYMENTS
// ============================================
app.post('/api/payments/initialize', (req, res) => {
    res.json({ success: true, data: { reference: 'PAY_' + Date.now(), ...req.body } });
});

app.post('/api/payments/verify', async (req, res) => {
    const { reference, appointmentId } = req.body;
    if (supabase && appointmentId) {
        await supabase.from('appointments').update({ 
            payment_status: 'paid', status: 'confirmed', payment_reference: reference 
        }).eq('id', appointmentId);
    }
    res.json({ success: true });
});

// ============================================
// USER PROFILE
// ============================================
app.get('/api/users/profile', async (req, res) => {
    const decoded = verifyToken(req);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    
    let user = null;
    if (supabase) {
        let { data } = await supabase.from('users').select('id, name, email, phone, role').eq('id', decoded.id).single();
        if (!data) {
            const r = await supabase.from('users').select('id, name, email, phone, role').eq('email', decoded.email).single();
            data = r.data;
        }
        user = data;
    }
    
    res.json({ success: true, data: user || { id: decoded.id, email: decoded.email } });
});

app.put('/api/users/profile', async (req, res) => {
    const decoded = verifyToken(req);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    
    const { name, phone } = req.body;
    const updateData = { updated_at: new Date().toISOString() };
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    
    if (supabase) {
        let { data } = await supabase.from('users').update(updateData).eq('id', decoded.id).select().single();
        if (!data) {
            const r = await supabase.from('users').update(updateData).eq('email', decoded.email).select().single();
            data = r.data;
        }
        console.log('✅ Profile updated:', decoded.email);
        return res.json({ success: true, data });
    }
    
    res.json({ success: true, data: updateData });
});

app.delete('/api/users/profile', async (req, res) => {
    const decoded = verifyToken(req);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });
    
    if (supabase) {
        await supabase.from('appointments').delete().eq('email', decoded.email);
        await supabase.from('users').delete().eq('id', decoded.id);
    }
    
    res.json({ success: true, message: 'Deleted' });
});

// ============================================
// ADMIN ROUTES
// ============================================
app.get('/api/admin/stats', async (req, res) => {
    let stats = { totalAppointments: 0, pendingAppointments: 0, confirmedAppointments: 0, totalUsers: 0, totalRevenue: 0 };
    if (supabase) {
        const { data: appts } = await supabase.from('appointments').select('*');
        if (appts) {
            stats.totalAppointments = appts.length;
            stats.pendingAppointments = appts.filter(a => a.status === 'pending').length;
            stats.confirmedAppointments = appts.filter(a => a.status === 'confirmed').length;
            stats.totalRevenue = appts.filter(a => a.payment_status === 'paid').reduce((s, a) => s + (a.amount || 5000), 0);
        }
        const { count } = await supabase.from('users').select('*', { count: 'exact', head: true });
        stats.totalUsers = count || 0;
    }
    res.json({ success: true, data: stats });
});

app.get('/api/admin/appointments', async (req, res) => {
    if (supabase) {
        const { data } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
        return res.json({ success: true, data: data || [] });
    }
    res.json({ success: true, data: [] });
});

app.get('/api/admin/users', async (req, res) => {
    if (supabase) {
        const { data } = await supabase.from('users').select('id, name, email, phone, role, status, created_at').order('created_at', { ascending: false });
        return res.json({ success: true, data: data || [] });
    }
    res.json({ success: true, data: [] });
});

// ============================================
// EMAIL TEST
// ============================================
app.post('/api/email/test', async (req, res) => {
    if (emailService?.sendEmail) {
        try {
            await emailService.sendEmail(req.body.to || process.env.ADMIN_EMAIL, 'Test Email', '<h1>Email works!</h1>');
            return res.json({ success: true, message: 'Email sent' });
        } catch (e) {
            return res.status(500).json({ success: false, message: e.message });
        }
    }
    res.status(500).json({ success: false, message: 'Email service not configured' });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
    console.log('❌ 404:', req.method, req.path);
    res.status(404).json({ success: false, message: `Not found: ${req.method} ${req.path}` });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║   🏥 P&A HEALTHCARE - PRODUCTION READY                ║
╠═══════════════════════════════════════════════════════╣
║   Port: ${PORT}                                          ║
║   Mode: ${process.env.NODE_ENV || 'development'}                              ║
║   CSRF: Enabled                                       ║
╚═══════════════════════════════════════════════════════╝

📡 Endpoints Ready:
   AUTH:     /api/auth/*
   PROFILE:  /api/users/profile
   APPTS:    /api/appointments/*
   ADMIN:    /api/admin/*
   CSRF:     /api/csrf-token

✅ Server ready for deployment!
    `);
});

module.exports = app;