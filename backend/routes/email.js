// ============================================
// EMAIL SERVICE - GMAIL SMTP
// Place this file at: backend/services/email.js
// ============================================

const nodemailer = require('nodemailer');
require('dotenv').config();

// Create Gmail transporter
let transporter = null;

// Check for email configuration
const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
const emailPass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASS;
const emailService = process.env.EMAIL_SERVICE || 'gmail';

if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
        service: emailService,
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });
    
    // Verify connection
    transporter.verify((error, success) => {
        if (error) {
            console.log('⚠️  Email service error:', error.message);
            console.log('   Make sure you have set up Gmail App Password correctly');
        } else {
            console.log('✅ Email service ready');
        }
    });
} else {
    console.log('⚠️  Email service not configured - set EMAIL_USER and EMAIL_PASSWORD in .env');
}

// ============================================
// EMAIL TEMPLATES
// ============================================

const templates = {
    
    // Welcome Email
    'welcome': (data) => `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1a936f 0%, #114b5f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🏥 P&A Institute</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">of Integrative Medicine</p>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #1a936f;">Welcome, ${data.name}! 🎉</h2>
                <p>Thank you for registering with P&A Institute of Integrative Medicine.</p>
                <p>You can now:</p>
                <ul>
                    <li>Book appointments online 24/7</li>
                    <li>Access our wide range of medical services</li>
                    <li>View and manage your appointments</li>
                    <li>Receive instant confirmations</li>
                </ul>
                <p style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.WEBSITE_URL || '#'}" style="background: linear-gradient(135deg, #1a936f, #114b5f); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">Book Your First Appointment</a>
                </p>
            </div>
            <div style="background: #114b5f; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="color: white; margin: 0;">P&A Institute of Integrative Medicine</p>
                <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0 0; font-size: 12px;">© ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </body>
        </html>
    `,
    
    // Appointment Confirmation
    'appointment-confirmation': (data) => `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1a936f 0%, #114b5f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🏥 P&A Institute</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <span style="background: #38a169; color: white; padding: 10px 25px; border-radius: 25px; font-weight: bold;">✅ Appointment Confirmed!</span>
                </div>
                <p>Dear <strong>${data.fullName}</strong>,</p>
                <p>Your appointment has been successfully booked!</p>
                
                <div style="background: white; padding: 20px; border-left: 4px solid #1a936f; margin: 20px 0;">
                    <h3 style="color: #114b5f; margin: 0 0 15px 0;">📋 Appointment Details</h3>
                    <p style="margin: 8px 0;"><strong>Service:</strong> ${data.service}</p>
                    <p style="margin: 8px 0;"><strong>Date:</strong> 📅 ${data.date}</p>
                    <p style="margin: 8px 0;"><strong>Time:</strong> 🕐 ${data.time}</p>
                    <p style="margin: 8px 0;"><strong>ID:</strong> #${data.appointmentId}</p>
                </div>
                
                <div style="background: #fffaf0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="color: #c05621; margin: 0 0 10px 0;">⚠️ Important Reminders:</h4>
                    <ul style="color: #744210; margin: 0; padding-left: 20px;">
                        <li>Please arrive 10-15 minutes early</li>
                        <li>Bring a valid ID</li>
                        <li>Contact us 24 hours in advance to reschedule</li>
                    </ul>
                </div>
            </div>
            <div style="background: #114b5f; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="color: white; margin: 0;">P&A Institute of Integrative Medicine</p>
                <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0 0; font-size: 12px;">📧 ${emailUser || 'info@pandainstitute.com'}</p>
            </div>
        </body>
        </html>
    `,
    
    // Payment Receipt
    'payment-receipt': (data) => `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1a936f 0%, #114b5f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🏥 P&A Institute</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Payment Receipt</p>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="width: 60px; height: 60px; background: #38a169; border-radius: 50%; display: inline-block; line-height: 60px; font-size: 30px;">✓</div>
                    <h2 style="color: #38a169; margin: 15px 0 0 0;">Payment Successful!</h2>
                </div>
                
                <p style="text-align: center;">Dear <strong>${data.fullName}</strong>, your payment has been processed.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #114b5f; text-align: center; border-bottom: 2px solid #1a936f; padding-bottom: 10px;">🧾 RECEIPT</h3>
                    <p style="margin: 10px 0;"><strong>Reference:</strong> ${data.reference}</p>
                    <p style="margin: 10px 0;"><strong>Service:</strong> ${data.service}</p>
                    <p style="margin: 10px 0;"><strong>Date:</strong> ${data.date} at ${data.time}</p>
                    <p style="margin: 10px 0;"><strong>Payment Method:</strong> ${data.paymentMethod || 'Online Payment'}</p>
                    
                    <div style="background: linear-gradient(135deg, #1a936f, #114b5f); padding: 20px; border-radius: 8px; text-align: center; margin-top: 20px;">
                        <span style="color: rgba(255,255,255,0.8); font-size: 12px;">AMOUNT PAID</span><br>
                        <strong style="color: white; font-size: 28px;">₦${Number(data.amount).toLocaleString()}</strong>
                    </div>
                </div>
                
                <p style="color: #666; font-size: 14px; text-align: center;">💡 Keep this receipt for your records.</p>
            </div>
            <div style="background: #114b5f; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="color: white; margin: 0;">P&A Institute of Integrative Medicine</p>
            </div>
        </body>
        </html>
    `,
    
    // Appointment Status Update
    'appointment-status-update': (data) => `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1a936f 0%, #114b5f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🏥 P&A Institute</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #114b5f;">📋 Appointment Status Update</h2>
                <p>Dear <strong>${data.fullName}</strong>,</p>
                <p>Your appointment status has been updated to:</p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <span style="background: ${data.status === 'confirmed' ? '#38a169' : data.status === 'cancelled' ? '#e53e3e' : '#d69e2e'}; color: white; padding: 12px 25px; border-radius: 25px; font-weight: bold; text-transform: uppercase;">${data.status}</span>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 8px;">
                    <p style="margin: 5px 0;"><strong>Service:</strong> ${data.service}</p>
                    <p style="margin: 5px 0;"><strong>Date:</strong> ${data.date}</p>
                    <p style="margin: 5px 0;"><strong>Time:</strong> ${data.time}</p>
                </div>
            </div>
            <div style="background: #114b5f; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="color: white; margin: 0;">P&A Institute of Integrative Medicine</p>
            </div>
        </body>
        </html>
    `,
    
    // Password Reset
    'password-reset': (data) => `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1a936f 0%, #114b5f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🏥 P&A Institute</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #114b5f; text-align: center;">🔐 Password Reset Request</h2>
                <p>Dear <strong>${data.name}</strong>,</p>
                <p>Click the button below to reset your password:</p>
                
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${data.resetUrl}" style="background: linear-gradient(135deg, #1a936f, #114b5f); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">Reset My Password</a>
                </p>
                
                <div style="background: #fffaf0; padding: 15px; border-radius: 8px;">
                    <p style="color: #744210; margin: 0; font-size: 14px;">⚠️ This link expires in 1 hour. If you didn't request this, ignore this email.</p>
                </div>
            </div>
            <div style="background: #114b5f; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="color: white; margin: 0;">P&A Institute of Integrative Medicine</p>
            </div>
        </body>
        </html>
    `,
    
    // Password Changed
    'password-changed': (data) => `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1a936f 0%, #114b5f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🏥 P&A Institute</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9; text-align: center;">
                <div style="width: 60px; height: 60px; background: #38a169; border-radius: 50%; display: inline-block; line-height: 60px; font-size: 30px;">✓</div>
                <h2 style="color: #38a169;">Password Changed Successfully!</h2>
                <p>Dear <strong>${data.name}</strong>,</p>
                <p>Your password has been changed. You can now log in with your new password.</p>
                
                <div style="background: #fff5f5; padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <p style="color: #c53030; margin: 0; font-size: 14px;">🚨 If you didn't make this change, contact us immediately.</p>
                </div>
            </div>
            <div style="background: #114b5f; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="color: white; margin: 0;">P&A Institute of Integrative Medicine</p>
            </div>
        </body>
        </html>
    `
};

// ============================================
// SEND EMAIL FUNCTION
// ============================================
async function sendEmail(options) {
    try {
        if (!transporter) {
            console.log('⚠️  Email service not configured - email not sent');
            return { success: false, error: 'Email service not configured' };
        }
        
        let htmlContent = options.html;
        let subject = options.subject;
        
        // If template provided, use it
        if (options.template && templates[options.template]) {
            htmlContent = templates[options.template](options.data || {});
            
            // Generate subject if not provided
            if (!subject) {
                const subjectMap = {
                    'welcome': '🏥 Welcome to P&A Institute of Integrative Medicine!',
                    'appointment-confirmation': '✅ Appointment Confirmed - P&A Institute',
                    'payment-receipt': '🧾 Payment Receipt - P&A Institute',
                    'appointment-status-update': '📋 Appointment Status Update - P&A Institute',
                    'password-reset': '🔐 Password Reset Request - P&A Institute',
                    'password-changed': '✅ Password Changed - P&A Institute'
                };
                subject = subjectMap[options.template] || 'Notification from P&A Institute';
            }
        }
        
        // Send email
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || `"P&A Institute" <${emailUser}>`,
            to: options.to,
            subject: subject,
            html: htmlContent
        });
        
        console.log(`✅ Email sent to ${options.to} - ID: ${info.messageId}`);
        
        return { success: true, messageId: info.messageId };
        
    } catch (error) {
        console.error('❌ Email sending error:', error.message);
        return { success: false, error: error.message };
    }
}

// ============================================
// SEND SMS PLACEHOLDER
// ============================================
async function sendSMS(options) {
    console.log('📱 SMS not configured');
    return { success: false, error: 'SMS not configured' };
}

// Export functions
module.exports = { sendEmail, sendSMS };