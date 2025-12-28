// ============================================
// APPOINTMENTS ROUTES - FIXED VERSION
// Properly connects to Supabase
// ============================================

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();

let supabase = null;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('   ↳ Appointments: Supabase connected');
} else {
    console.log('   ↳ Appointments: Using in-memory storage');
}

// In-memory fallback
let appointments = [];

// ============================================
// CREATE APPOINTMENT
// ============================================
router.post('/', async (req, res) => {
    try {
        console.log('📥 New appointment request:', req.body);
        
        const { fullName, email, phone, service, date, time, message } = req.body;
        
        if (!fullName || !email || !phone || !service || !date || !time) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: fullName, email, phone, service, date, time'
            });
        }
        
        const appointmentId = 'APT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        
        const appointmentData = {
            id: appointmentId,
            full_name: fullName,
            email: email.toLowerCase().trim(),
            phone: phone,
            service: service,
            date: date,
            time: time,
            message: message || '',
            status: 'pending',
            payment_status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        let savedAppointment = null;
        
        if (supabase) {
            console.log('💾 Saving to Supabase...');
            
            const { data, error } = await supabase
                .from('appointments')
                .insert([appointmentData])
                .select()
                .single();
            
            if (error) {
                console.error('❌ Supabase error:', error.message);
                appointments.push(appointmentData);
                savedAppointment = appointmentData;
            } else {
                console.log('✅ Saved to Supabase');
                savedAppointment = data;
            }
        } else {
            appointments.push(appointmentData);
            savedAppointment = appointmentData;
            console.log('💾 Saved to memory');
        }
        
        // Send confirmation email (non-blocking)
        try {
            const emailService = req.app.locals.emailService;
            if (emailService && emailService.sendAppointmentConfirmation) {
                emailService.sendAppointmentConfirmation(email, {
                    patientName: fullName,
                    service: service,
                    date: date,
                    time: time
                }).catch(err => console.log('⚠️  Confirmation email failed:', err.message));
            } else if (emailService && emailService.sendEmail) {
                emailService.sendEmail(
                    email,
                    'Appointment Confirmed - P&A Institute',
                    `<h1>Appointment Confirmed!</h1>
                    <p>Hi ${fullName},</p>
                    <p>Your appointment has been scheduled:</p>
                    <ul>
                        <li><strong>Service:</strong> ${service}</li>
                        <li><strong>Date:</strong> ${date}</li>
                        <li><strong>Time:</strong> ${time}</li>
                    </ul>
                    <p>Please arrive 10 minutes early.</p>
                    <p>Thank you for choosing P&A Institute of Integrative Medicine!</p>`
                ).catch(err => console.log('⚠️  Confirmation email failed:', err.message));
            }
        } catch (e) {
            console.log('⚠️  Email service not available');
        }
        
        res.status(201).json({
            success: true,
            message: 'Appointment created successfully',
            data: {
                id: savedAppointment.id,
                appointmentId: savedAppointment.id,
                fullName: savedAppointment.full_name,
                email: savedAppointment.email,
                service: savedAppointment.service,
                date: savedAppointment.date,
                time: savedAppointment.time,
                status: savedAppointment.status
            }
        });
        
    } catch (error) {
        console.error('❌ Create appointment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// GET ALL APPOINTMENTS
// ============================================
router.get('/', async (req, res) => {
    try {
        let list = [];
        
        if (supabase) {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('❌ Supabase fetch error:', error.message);
                list = appointments;
            } else {
                list = data || [];
            }
        } else {
            list = appointments;
        }
        
        res.json({
            success: true,
            data: list,
            count: list.length
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// GET SINGLE APPOINTMENT
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let appointment = null;
        
        if (supabase) {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('id', id)
                .single();
            
            if (!error) appointment = data;
        }
        
        if (!appointment) {
            appointment = appointments.find(a => a.id === id);
        }
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
        res.json({ success: true, data: appointment });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// UPDATE APPOINTMENT
// ============================================
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, payment_status, payment_reference } = req.body;
        
        const updateData = { updated_at: new Date().toISOString() };
        
        if (status) updateData.status = status;
        if (payment_status) updateData.payment_status = payment_status;
        if (payment_reference) updateData.payment_reference = payment_reference;
        
        let updatedAppointment = null;
        
        if (supabase) {
            const { data, error } = await supabase
                .from('appointments')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            
            if (!error) {
                updatedAppointment = data;
                console.log('✅ Appointment updated in Supabase');
            }
        }
        
        // Update in memory too
        const idx = appointments.findIndex(a => a.id === id);
        if (idx !== -1) {
            appointments[idx] = { ...appointments[idx], ...updateData };
            if (!updatedAppointment) updatedAppointment = appointments[idx];
        }
        
        if (!updatedAppointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
        // Send status update email
        if (status) {
            try {
                const emailService = req.app.locals.emailService;
                if (emailService && emailService.sendEmail) {
                    emailService.sendEmail(
                        updatedAppointment.email,
                        `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)} - P&A Institute`,
                        `<h1>Appointment Update</h1>
                        <p>Hi ${updatedAppointment.full_name},</p>
                        <p>Your appointment status has been updated to: <strong>${status}</strong></p>
                        <p>Service: ${updatedAppointment.service}</p>
                        <p>Date: ${updatedAppointment.date} at ${updatedAppointment.time}</p>`
                    ).catch(err => console.log('⚠️  Status email failed:', err.message));
                }
            } catch (e) {
                console.log('⚠️  Email not sent');
            }
        }
        
        res.json({
            success: true,
            message: 'Appointment updated',
            data: updatedAppointment
        });
        
    } catch (error) {
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
            await supabase
                .from('appointments')
                .delete()
                .eq('id', id);
        }
        
        const idx = appointments.findIndex(a => a.id === id);
        if (idx !== -1) {
            appointments.splice(idx, 1);
        }
        
        res.json({ success: true, message: 'Appointment deleted' });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// GET APPOINTMENTS BY EMAIL
// ============================================
router.get('/user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const normalizedEmail = email.toLowerCase().trim();
        
        let list = [];
        
        if (supabase) {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('email', normalizedEmail)
                .order('created_at', { ascending: false });
            
            if (!error) list = data || [];
        }
        
        if (list.length === 0) {
            list = appointments.filter(a => a.email === normalizedEmail);
        }
        
        res.json({
            success: true,
            data: list,
            count: list.length
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
