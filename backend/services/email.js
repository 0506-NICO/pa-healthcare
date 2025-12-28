// ============================================
// EMAIL SERVICE - FIXED FOR 2025
// Tries multiple ports and methods
// ============================================

const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;
let emailReady = false;
let connectionMethod = 'none';

// ============================================
// TRY MULTIPLE CONNECTION METHODS
// ============================================
const initializeEmail = async () => {
    const user = process.env.EMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS;
    
    if (!user || !pass) {
        console.log('⚠️  Email credentials not found in .env');
        return;
    }
    
    console.log(`📧 Initializing email for: ${user}`);
    
    // Method 1: Gmail with OAuth-like settings (port 587 TLS)
    const configs = [
        {
            name: 'Gmail TLS (587)',
            config: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: { user, pass },
                tls: { 
                    ciphers: 'SSLv3',
                    rejectUnauthorized: false 
                },
                connectionTimeout: 10000,
                greetingTimeout: 10000
            }
        },
        {
            name: 'Gmail SSL (465)',
            config: {
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: { user, pass },
                connectionTimeout: 10000,
                greetingTimeout: 10000
            }
        },
        {
            name: 'Gmail Service',
            config: {
                service: 'gmail',
                auth: { user, pass },
                connectionTimeout: 10000
            }
        }
    ];
    
    // Try each config
    for (const { name, config } of configs) {
        try {
            console.log(`   Trying ${name}...`);
            const testTransporter = nodemailer.createTransport(config);
            
            // Quick verify with timeout
            await Promise.race([
                testTransporter.verify(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), 8000)
                )
            ]);
            
            // Success!
            transporter = testTransporter;
            emailReady = true;
            connectionMethod = name;
            console.log(`✅ Email connected via ${name}`);
            return;
            
        } catch (err) {
            console.log(`   ❌ ${name} failed: ${err.message}`);
        }
    }
    
    // All methods failed - setup fallback
    console.log('⚠️  All email methods failed - using queue fallback');
    console.log('   Check: 1) App password correct  2) Less secure apps enabled');
    console.log('   Or try: https://myaccount.google.com/apppasswords');
    
    // Create a non-verified transporter anyway (might work for sending)
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
    });
    emailReady = true; // Allow attempts
    connectionMethod = 'unverified';
};

// Initialize on load
initializeEmail();

// ============================================
// EMAIL QUEUE (Fallback)
// ============================================
const emailQueue = [];

const queueEmail = (to, subject, html) => {
    const email = {
        id: 'EMAIL_' + Date.now(),
        to, subject, html,
        queued_at: new Date().toISOString(),
        status: 'queued'
    };
    emailQueue.push(email);
    console.log(`📧 Email queued: "${subject}" → ${to}`);
    
    // Log to file for manual sending if needed
    const fs = require('fs');
    try {
        fs.appendFileSync('email_queue.log', 
            `\n[${email.queued_at}] To: ${to}\nSubject: ${subject}\n---\n`
        );
    } catch (e) {}
    
    return email;
};

const getQueuedEmails = () => emailQueue;

// ============================================
// SEND EMAIL
// ============================================
const sendEmail = async (to, subject, html) => {
    console.log(`📧 Sending: "${subject}" → ${to}`);
    
    if (!transporter) {
        console.log('⚠️  No transporter - queuing');
        return queueEmail(to, subject, html);
    }
    
    try {
        const result = await transporter.sendMail({
            from: process.env.EMAIL_FROM || `P&A Institute <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
        
        console.log(`✅ Email sent to: ${to}`);
        return result;
        
    } catch (error) {
        console.log(`⚠️  Send failed: ${error.message}`);
        return queueEmail(to, subject, html);
    }
};

// ============================================
// APPOINTMENT CONFIRMATION
// ============================================
const sendAppointmentConfirmation = async (data) => {
    const { to, name, service, date, time, appointmentId } = data;
    
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0d9488, #14b8a6); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">✅ Appointment Confirmed!</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
                <p>Your appointment has been booked successfully!</p>
                
                <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #0d9488;">
                    <p style="margin: 8px 0;"><strong>📋 Service:</strong> ${service}</p>
                    <p style="margin: 8px 0;"><strong>📅 Date:</strong> ${date}</p>
                    <p style="margin: 8px 0;"><strong>🕐 Time:</strong> ${time}</p>
                    <p style="margin: 8px 0;"><strong>🔖 Reference:</strong> ${appointmentId}</p>
                </div>
                
                <p><strong>Please arrive 10 minutes early.</strong></p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="color: #666; font-size: 14px;">
                        📍 ${process.env.BUSINESS_ADDRESS || 'P&A Institute'}<br>
                        📞 ${process.env.BUSINESS_PHONE || '+234 905 5066 381'}
                    </p>
                </div>
            </div>
        </div>
    `;
    
    return sendEmail(to, 'Appointment Confirmed - P&A Institute', html);
};

// ============================================
// STATUS UPDATE EMAIL
// ============================================
const sendStatusUpdate = async (email, data) => {
    const colors = {
        confirmed: '#27ae60',
        cancelled: '#e74c3c', 
        completed: '#3498db',
        pending: '#f39c12'
    };
    
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: ${colors[data.status] || '#333'}; padding: 25px; text-align: center;">
                <h1 style="color: white; margin: 0;">
                    Appointment ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                </h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <p>Hi ${data.full_name || data.fullName || 'Patient'},</p>
                <p>Your appointment for <strong>${data.service}</strong> on <strong>${data.date}</strong> at <strong>${data.time}</strong> has been <strong style="color: ${colors[data.status]}">${data.status}</strong>.</p>
                <p style="margin-top: 30px; color: #666;">Thank you for choosing P&A Institute!</p>
            </div>
        </div>
    `;
    
    return sendEmail(email, `Appointment ${data.status} - P&A Institute`, html);
};

// ============================================
// PAYMENT CONFIRMATION
// ============================================
const sendPaymentConfirmation = async (email, data) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #27ae60; padding: 25px; text-align: center;">
                <h1 style="color: white; margin: 0;">💰 Payment Received!</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <p>Hi ${data.name || 'Customer'},</p>
                <p>We've received your payment of <strong>₦${data.amount?.toLocaleString()}</strong>.</p>
                <p><strong>Reference:</strong> ${data.reference}</p>
                <p style="margin-top: 30px; color: #666;">Thank you!</p>
            </div>
        </div>
    `;
    
    return sendEmail(email, 'Payment Received - P&A Institute', html);
};

// ============================================
// WELCOME EMAIL
// ============================================
const sendWelcomeEmail = async (email, name) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0d9488, #14b8a6); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Welcome to P&A Institute!</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
                <p>Thank you for registering with P&A Institute of Integrative Medicine.</p>
                <p>You can now:</p>
                <ul>
                    <li>Book appointments online</li>
                    <li>View your appointment history</li>
                    <li>Access your health records</li>
                </ul>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5500'}" 
                       style="background: #0d9488; color: white; padding: 15px 30px; 
                              text-decoration: none; border-radius: 25px; display: inline-block;">
                        Book Appointment
                    </a>
                </div>
            </div>
        </div>
    `;
    
    return sendEmail(email, 'Welcome to P&A Institute!', html);
};

// ============================================
// PASSWORD RESET
// ============================================
const sendPasswordResetEmail = async (email, token, name) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password.html?token=${token}`;
    
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #e74c3c; padding: 25px; text-align: center;">
                <h1 style="color: white; margin: 0;">Password Reset</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <p>Hi ${name},</p>
                <p>Click below to reset your password (expires in 1 hour):</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="background: #e74c3c; color: white; padding: 15px 30px; 
                              text-decoration: none; border-radius: 25px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #999; font-size: 12px;">If you didn't request this, ignore this email.</p>
            </div>
        </div>
    `;
    
    return sendEmail(email, 'Reset Your Password - P&A Institute', html);
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
    sendEmail,
    sendAppointmentConfirmation,
    sendStatusUpdate,
    sendPaymentConfirmation,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    getQueuedEmails,
    getStatus: () => ({ ready: emailReady, method: connectionMethod })
};