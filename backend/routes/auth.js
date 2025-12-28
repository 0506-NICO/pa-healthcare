// ============================================
// AUTH ROUTES - WITH WELCOME EMAIL
// ============================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();
let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('   ↳ Auth: Supabase connected');
}

// Email Service - Import from parent
let emailService = null;
const initEmailService = (service) => {
    emailService = service;
    console.log('   ↳ Auth: Email service connected');
};

let users = [];

// ============================================
// JWT - HARDCODED TO MATCH SERVER.JS
// ============================================
const JWT_SECRET = 'pa-healthcare-2025-secret-key';
const JWT_EXPIRES_IN = '7d';

// ============================================
// WELCOME EMAIL TEMPLATE
// ============================================
const sendWelcomeEmail = async (user) => {
    if (!emailService) {
        console.log('⚠️ Email service not available for welcome email');
        return;
    }
    
    try {
        const mailOptions = {
            from: `"P&A Institute" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Welcome to P&A Institute! 🏥',
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
        .content { padding: 40px 30px; }
        .welcome-box { background: #f0fdfa; border-left: 4px solid #14b8a6; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .features { margin: 30px 0; }
        .feature { display: flex; align-items: center; margin: 15px 0; }
        .feature-icon { width: 40px; height: 40px; background: #14b8a6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; margin-right: 15px; }
        .btn { display: inline-block; background: #14b8a6; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #1a1a2e; color: #888; padding: 30px; text-align: center; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Welcome to P&A Institute!</h1>
            <p>Your Health is Our Top Priority</p>
        </div>
        <div class="content">
            <h2>Hello ${user.name}! 👋</h2>
            
            <div class="welcome-box">
                <strong>Your account has been created successfully!</strong><br>
                You can now access all our healthcare services online.
            </div>
            
            <div class="features">
                <h3>What you can do now:</h3>
                <div class="feature">
                    <div class="feature-icon">📅</div>
                    <div><strong>Book Appointments</strong> - Schedule with our expert doctors</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">💊</div>
                    <div><strong>Access Services</strong> - General consultations, specialists & more</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">📱</div>
                    <div><strong>24/7 Access</strong> - Manage your health anytime, anywhere</div>
                </div>
            </div>
            
            <center>
                <a href="https://my-pa-health.vercel.app" class="btn">Visit Your Dashboard →</a>
            </center>
            
            <p style="color: #666; margin-top: 30px;">
                If you have any questions, feel free to contact us. We're here to help!
            </p>
        </div>
        <div class="footer">
            <p><strong>P&A Institute</strong> - Integrative Medicine</p>
            <p>© 2025 All rights reserved</p>
        </div>
    </div>
</body>
</html>
            `
        };
        
        await emailService.sendMail(mailOptions);
        console.log('📧 Welcome email sent to:', user.email);
    } catch (error) {
        console.log('⚠️ Welcome email failed:', error.message);
    }
};

// ============================================
// REGISTER
// ============================================
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email and password are required' });
        }
        
        const normalizedEmail = email.toLowerCase().trim();
        
        // Check exists
        if (supabase) {
            const { data } = await supabase.from('users').select('id').eq('email', normalizedEmail).single();
            if (data) return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }
        
        // Also check in-memory
        if (users.find(u => u.email === normalizedEmail)) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const userData = {
            id: 'USR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            name: name.trim(),
            email: normalizedEmail,
            phone: phone || '',
            password: hashedPassword,
            role: 'user',
            status: 'active',
            created_at: new Date().toISOString()
        };
        
        if (supabase) {
            const { error } = await supabase.from('users').insert([userData]);
            if (error) console.error('DB error:', error.message);
        }
        users.push(userData);
        
        const token = jwt.sign(
            { id: userData.id, email: userData.email, role: userData.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        
        console.log('✅ Registered:', normalizedEmail);
        
        // Send welcome email (async - don't wait)
        sendWelcomeEmail(userData);
        
        const { password: _, ...userWithoutPassword } = userData;
        res.status(201).json({ success: true, message: 'Registration successful! Welcome email sent.', data: { user: userWithoutPassword, token } });
        
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// LOGIN
// ============================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        
        const normalizedEmail = email.toLowerCase().trim();
        let user = null;
        
        if (supabase) {
            const { data } = await supabase.from('users').select('*').eq('email', normalizedEmail).single();
            if (data) user = data;
        }
        if (!user) user = users.find(u => u.email === normalizedEmail);
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        
        console.log('✅ Login:', normalizedEmail);
        
        const { password: _, ...userWithoutPassword } = user;
        res.json({ success: true, message: 'Login successful', data: { user: userWithoutPassword, token } });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// GET ME
// ============================================
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token' });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        
        let user = null;
        if (supabase) {
            const { data } = await supabase.from('users').select('id, name, email, phone, role').eq('id', decoded.id).single();
            user = data;
        }
        if (!user) {
            const mem = users.find(u => u.id === decoded.id);
            if (mem) { const { password, ...u } = mem; user = u; }
        }
        
        res.json({ success: true, data: user || decoded });
        
    } catch (error) {
        console.log('Auth/me error:', error.message);
        res.status(401).json({ success: false, message: error.message });
    }
});

// ============================================
// LOGOUT
// ============================================
router.post('/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out' });
});

// Export router and init function
module.exports = router;
module.exports.initEmailService = initEmailService;