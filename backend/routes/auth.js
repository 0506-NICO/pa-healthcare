// ============================================
// AUTH ROUTES - MATCHING JWT SECRET
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

let users = [];

// ============================================
// JWT - HARDCODED TO MATCH SERVER.JS
// ============================================
const JWT_SECRET = 'pa-healthcare-2025-secret-key';
const JWT_EXPIRES_IN = '7d';

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
            if (data) return res.status(400).json({ success: false, message: 'User already exists' });
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
        
        const { password: _, ...userWithoutPassword } = userData;
        res.status(201).json({ success: true, message: 'Registration successful', data: { user: userWithoutPassword, token } });
        
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

module.exports = router;