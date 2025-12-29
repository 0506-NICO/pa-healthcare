// ============================================
// APPOINTMENTS ROUTES - WITH EMAIL NOTIFICATIONS
// ============================================

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Supabase
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();
let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('   ↳ Appointments: Supabase connected');
}

// Email transporter
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    console.log('   ↳ Appointments: Email service ready');
}

let appointments = [];

// ============================================
// EMAIL TEMPLATES
// ============================================
const sendAppointmentEmail = async (appointment, type) => {
    if (!transporter) {
        console.log('⚠️ No email transporter');
        return { success: false };
    }
    
    const templates = {
        'booked': {
            subject: '📅 Appointment Booked - P&A Institute',
            title: 'Appointment Booked!',
            message: 'Your appointment has been successfully booked and is pending confirmation.',
            color: '#f59e0b',
            icon: '📅'
        },
        'confirmed': {
            subject: '✅ Appointment Confirmed - P&A Institute',
            title: 'Appointment Confirmed!',
            message: 'Great news! Your appointment has been confirmed by our team.',
            color: '#10b981',
            icon: '✅'
        },
        'cancelled': {
            subject: '❌ Appointment Cancelled - P&A Institute',
            title: 'Appointment Cancelled',
            message: 'Your appointment has been cancelled. Please book a new appointment if needed.',
            color: '#ef4444',
            icon: '❌'
        },
        'completed': {
            subject: '🎉 Appointment Completed - P&A Institute',
            title: 'Thank You!',
            message: 'Your appointment has been marked as completed. We hope you had a great experience!',
            color: '#3b82f6',
            icon: '🎉'
        }
    };
    
    const template = templates[type] || templates['booked'];
    
    try {
        const mailOptions = {
            from: `"P&A Institute" <${process.env.EMAIL_USER}>`,
            to: appointment.email,
            subject: template.subject,
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
            <h1 style="color:white;margin:0;font-size:28px;">🏥 P&A Institute</h1>
            <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;">Appointment Update</p>
        </div>
        <div style="padding:40px 30px;">
            <div style="text-align:center;margin-bottom:30px;">
                <span style="font-size:60px;">${template.icon}</span>
                <h2 style="margin:15px 0 0;color:${template.color};">${template.title}</h2>
            </div>
            
            <p style="font-size:16px;color:#333;text-align:center;margin-bottom:30px;">
                ${template.message}
            </p>
            
            <div style="background:#f8fafc;border-radius:12px;padding:25px;margin:20px 0;">
                <h3 style="margin:0 0 20px;color:#333;border-bottom:2px solid ${template.color};padding-bottom:10px;">
                    Appointment Details
                </h3>
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="padding:10px 0;color:#666;width:40%;">Patient Name:</td>
                        <td style="padding:10px 0;color:#333;font-weight:600;">${appointment.full_name || appointment.fullName}</td>
                    </tr>
                    <tr>
                        <td style="padding:10px 0;color:#666;">Service:</td>
                        <td style="padding:10px 0;color:#333;font-weight:600;">${appointment.service}</td>
                    </tr>
                    <tr>
                        <td style="padding:10px 0;color:#666;">Date:</td>
                        <td style="padding:10px 0;color:#333;font-weight:600;">${appointment.date}</td>
                    </tr>
                    <tr>
                        <td style="padding:10px 0;color:#666;">Time:</td>
                        <td style="padding:10px 0;color:#333;font-weight:600;">${appointment.time}</td>
                    </tr>
                    <tr>
                        <td style="padding:10px 0;color:#666;">Status:</td>
                        <td style="padding:10px 0;">
                            <span style="background:${template.color};color:white;padding:5px 15px;border-radius:20px;font-size:12px;font-weight:600;text-transform:uppercase;">
                                ${type}
                            </span>
                        </td>
                    </tr>
                </table>
            </div>
            
            ${type === 'confirmed' ? `
            <div style="background:#f0fdfa;border-left:4px solid #14b8a6;padding:15px 20px;margin:20px 0;border-radius:0 8px 8px 0;">
                <strong>📍 Reminder:</strong><br>
                Please arrive 15 minutes before your scheduled time.<br>
                Location: No 8 Animashaun Cl, Lagos
            </div>
            ` : ''}
            
            ${type === 'cancelled' ? `
            <div style="text-align:center;margin:30px 0;">
                <a href="https://my-pa-health.vercel.app" style="display:inline-block;background:#14b8a6;color:white;padding:14px 30px;text-decoration:none;border-radius:8px;font-weight:600;">
                    Book New Appointment →
                </a>
            </div>
            ` : ''}
            
            <p style="color:#666;margin-top:30px;font-size:14px;">
                If you have any questions, please contact us at <a href="mailto:miniquehairs@gmail.com" style="color:#14b8a6;">miniquehairs@gmail.com</a>
            </p>
        </div>
        <div style="background:#1a1a2e;color:#888;padding:30px;text-align:center;font-size:14px;">
            <p style="margin:0;"><strong>P&A Institute</strong> - Integrative Medicine</p>
            <p style="margin:10px 0 0;">📞 +234 905 5066 381 | 📍 Lagos, Nigeria</p>
            <p style="margin:10px 0 0;">© 2025 All rights reserved</p>
        </div>
    </div>
</body>
</html>
            `
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`📧 ${type} email sent to:`, appointment.email);
        return { success: true };
    } catch (error) {
        console.log(`⚠️ ${type} email failed:`, error.message);
        return { success: false, error: error.message };
    }
};

// ============================================
// CREATE APPOINTMENT
// ============================================
router.post('/', async (req, res) => {
    try {
        const { fullName, full_name, email, phone, service, date, time, message } = req.body;
        
        const patientName = fullName || full_name;
        
        if (!patientName || !email || !service || !date || !time) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, email, service, date and time are required' 
            });
        }
        
        const appointmentData = {
            id: 'APT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            full_name: patientName.trim(),
            email: email.toLowerCase().trim(),
            phone: phone || '',
            service,
            date,
            time,
            message: message || '',
            status: 'pending',
            created_at: new Date().toISOString()
        };
        
        // Save to Supabase
        if (supabase) {
            const { error } = await supabase.from('appointments').insert([appointmentData]);
            if (error) {
                console.error('DB error:', error.message);
            }
        }
        appointments.push(appointmentData);
        
        console.log('✅ Appointment created:', appointmentData.id);
        
        // Send booking confirmation email
        sendAppointmentEmail(appointmentData, 'booked').then(result => {
            if (result.success) {
                console.log('✅ Booking email sent to', appointmentData.email);
            }
        });
        
        res.status(201).json({ 
            success: true, 
            message: 'Appointment booked successfully! Confirmation email sent.', 
            data: appointmentData 
        });
        
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// GET ALL APPOINTMENTS
// ============================================
router.get('/', async (req, res) => {
    try {
        let allAppointments = [];
        
        if (supabase) {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (data) allAppointments = data;
            if (error) console.error('DB error:', error.message);
        }
        
        // Merge with in-memory
        const merged = [...allAppointments];
        appointments.forEach(apt => {
            if (!merged.find(a => a.id === apt.id)) {
                merged.push(apt);
            }
        });
        
        res.json({ success: true, data: merged });
        
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// GET USER'S APPOINTMENTS
// ============================================
router.get('/user/:email', async (req, res) => {
    try {
        const email = req.params.email.toLowerCase().trim();
        let userAppointments = [];
        
        if (supabase) {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('email', email)
                .order('created_at', { ascending: false });
            
            if (data) userAppointments = data;
            if (error) console.error('DB error:', error.message);
        }
        
        // Also check in-memory
        const inMemory = appointments.filter(a => a.email === email);
        inMemory.forEach(apt => {
            if (!userAppointments.find(a => a.id === apt.id)) {
                userAppointments.push(apt);
            }
        });
        
        res.json({ success: true, data: userAppointments });
        
    } catch (error) {
        console.error('Get user appointments error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// UPDATE APPOINTMENT STATUS
// ============================================
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }
        
        let appointment = null;
        
        // Update in Supabase
        if (supabase) {
            const { data, error } = await supabase
                .from('appointments')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();
            
            if (data) appointment = data;
            if (error) console.error('DB update error:', error.message);
        }
        
        // Also update in-memory
        const memIndex = appointments.findIndex(a => a.id === id);
        if (memIndex !== -1) {
            appointments[memIndex].status = status;
            if (!appointment) appointment = appointments[memIndex];
        }
        
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        
        console.log(`✅ Appointment ${id} updated to: ${status}`);
        
        // Send status update email
        sendAppointmentEmail(appointment, status).then(result => {
            if (result.success) {
                console.log(`✅ ${status} email sent to`, appointment.email);
            }
        });
        
        res.json({ 
            success: true, 
            message: `Appointment ${status}! Email notification sent.`, 
            data: appointment 
        });
        
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// DELETE APPOINTMENT
// ============================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (supabase) {
            const { error } = await supabase.from('appointments').delete().eq('id', id);
            if (error) console.error('DB delete error:', error.message);
        }
        
        appointments = appointments.filter(a => a.id !== id);
        
        console.log('✅ Appointment deleted:', id);
        
        res.json({ success: true, message: 'Appointment deleted' });
        
    } catch (error) {
        console.error('Delete appointment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;