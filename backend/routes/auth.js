// ============================================
// AUTH ROUTES - WITH WELCOME EMAIL
// ============================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Supabase
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();
let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('   ↳ Auth: Supabase connected');
}

// Email transporter - create directly in auth.js
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    transporter.verify((err) => {
        if (err) {
            console.log('   ↳ Auth: Email error -', err.message);
        } else {
            console.log('   ↳ Auth: Email service ready ✓');
        }
    });
}

let users = [];

// ============================================
// JWT CONFIG
// ============================================
const JWT_SECRET = process.env.JWT_SECRET || 'pa-healthcare-2025-secret-key';
const JWT_EXPIRES_IN = '7d';

// ============================================
// WELCOME EMAIL TEMPLATE
// ============================================
const sendWelcomeEmail = async (user) => {
    if (!transporter) {
        console.log('⚠️ No email transporter for welcome email');
        return { success: false };
    }
    
    try {
        const mailOptions = {
            from: `"P&A Institute" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: '🏥 Welcome to P&A Institute!',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f5;">
    <div style="max-width:600px;margin:0 auto;background:white;">
        <div style="background:linear-gradient(135deg,#0d9488 0%,#14b8a6 100%);padding:40px 30px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:28px;">🏥 Welcome to P&A Institute!</h1>
            <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;">Your Health is Our Top Priority</p>
        </div>
        <div style="padding:40px 30px;">
            <h2 style="margin:0 0 20px;">Hello ${user.name}! 👋</h2>
            
            <div style="background:#f0fdfa;border-left:4px solid #14b8a6;padding:20px;margin:20px 0;border-radius:0 8px 8px 0;">
                <strong>Your account has been created successfully!</strong><br>
                You can now access all our healthcare services online.
            </div>
            
            <h3 style="margin:30px 0 15px;">What you can do now:</h3>
            
            <div style="margin:15px 0;display:flex;align-items:center;">
                <span style="width:40px;height:40px;background:#14b8a6;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:white;margin-right:15px;font-size:18px;">📅</span>
                <div><strong>Book Appointments</strong> - Schedule with our expert doctors</div>
            </div>
            
            <div style="margin:15px 0;display:flex;align-items:center;">
                <span style="width:40px;height:40px;background:#14b8a6;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:white;margin-right:15px;font-size:18px;">💊</span>
                <div><strong>Access Services</strong> - General consultations, specialists & more</div>
            </div>
            
            <div style="margin:15px 0;display:flex;align-items:center;">
                <span style="width:40px;height:40px;background:#14b8a6;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:white;margin-right:15px;font-size:18px;">📱</span>
                <div><strong>24/7 Access</strong> - Manage your health anytime, anywhere</div>
            </div>
            
            <div style="text-align:center;margin:30px 0;">
                <a href="https://my-pa-health.vercel.app" style="display:inline-block;background:#14b8a6;color:white;padding:14px 30px;text-decoration:none;border-radius:8px;font-weight:600;">Visit Your Dashboard →</a>
            </div>
            
            <p style="color:#666;margin-top:30px;">
                If you have any questions, feel free to contact us. We're here to help!
            </p>
        </div>
        <div style="background:#1a1a2e;color:#888;padding:30px;text-align:center;font-size:14px;">
            <p style="margin:0;"><strong>P&A Institute</strong> - Integrative Medicine</p>
            <p style="margin:10px 0 0;">© 2025 All rights reserved</p>
        </div>
    </div>
</body>
</html>
            `
        };
        
        await transporter.sendMail(mailOptions);
        console.log('📧 Welcome email sent to:', user.email);
        return { success: true };
    } catch (error) {
        console.log('⚠️ Welcome email failed:', error.message);
        return { success: false, error: error.message };
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
        
        // Check if user exists in Supabase
        if (supabase) {
            const { data } = await supabase.from('users').select('id').eq('email', normalizedEmail).single();
            if (data) {
                return res.status(400).json({ success: false, message: 'User already exists with this email' });
            }
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
        
        // Save to Supabase
        if (supabase) {
            const { error } = await supabase.from('users').insert([userData]);
            if (error) console.error('DB error:', error.message);
        }
        users.push(userData);
        
        // Generate token
        const token = jwt.sign(
            { id: userData.id, email: userData.email, role: userData.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        
        console.log('✅ Registered:', normalizedEmail);
        
        // Send welcome email (don't wait)
        sendWelcomeEmail(userData).then(result => {
            if (result.success) {
                console.log('✅ Welcome email delivered to', userData.email);
            }
        });
        
        const { password: _, ...userWithoutPassword } = userData;
        res.status(201).json({ 
            success: true, 
            message: 'Registration successful! Welcome email sent.', 
            data: { user: userWithoutPassword, token } 
        });
        
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
        
        // Find in Supabase
        if (supabase) {
            const { data } = await supabase.from('users').select('*').eq('email', normalizedEmail).single();
            if (data) user = data;
        }
        
        // Fallback to in-memory
        if (!user) {
            user = users.find(u => u.email === normalizedEmail);
        }
        
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
            if (mem) { 
                const { password, ...u } = mem; 
                user = u; 
            }
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

module.exports = router;