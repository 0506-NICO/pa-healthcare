// ============================================
// EMAIL SERVICE - USING RESEND
// ============================================

const { Resend } = require('resend');

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_PLytx8TP_7wV4RP3L83X6cihavtVre1Yi');

// Your verified sender email (use Resend's default for now)
const FROM_EMAIL = process.env.FROM_EMAIL || 'P&A Institute <onboarding@resend.dev>';

console.log('📧 Email service: Resend initialized');

// ============================================
// SEND EMAIL FUNCTION
// ============================================
async function sendEmail(to, subject, html) {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: to,
            subject: subject,
            html: html
        });

        if (error) {
            console.log('❌ Email error:', error.message);
            return { success: false, error: error.message };
        }

        console.log('✅ Email sent to:', to);
        return { success: true, id: data?.id };
    } catch (err) {
        console.log('❌ Email failed:', err.message);
        return { success: false, error: err.message };
    }
}

// ============================================
// APPOINTMENT CONFIRMATION EMAIL
// ============================================
async function sendAppointmentConfirmation({ to, name, service, date, time, appointmentId }) {
    const subject = '📅 Appointment Booked - P&A Institute';
    const html = `
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
            <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;">Appointment Confirmation</p>
        </div>
        <div style="padding:40px 30px;">
            <div style="text-align:center;margin-bottom:30px;">
                <span style="font-size:60px;">📅</span>
                <h2 style="margin:15px 0 0;color:#f59e0b;">Appointment Booked!</h2>
            </div>
            
            <p style="font-size:16px;color:#333;text-align:center;margin-bottom:30px;">
                Hi <strong>${name}</strong>, your appointment has been successfully booked and is pending confirmation.
            </p>
            
            <div style="background:#f8fafc;border-radius:12px;padding:25px;margin:20px 0;">
                <h3 style="margin:0 0 20px;color:#333;border-bottom:2px solid #f59e0b;padding-bottom:10px;">
                    Appointment Details
                </h3>
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="padding:10px 0;color:#666;width:40%;">Reference:</td>
                        <td style="padding:10px 0;color:#333;font-weight:600;">${appointmentId || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding:10px 0;color:#666;">Service:</td>
                        <td style="padding:10px 0;color:#333;font-weight:600;">${service}</td>
                    </tr>
                    <tr>
                        <td style="padding:10px 0;color:#666;">Date:</td>
                        <td style="padding:10px 0;color:#333;font-weight:600;">${date}</td>
                    </tr>
                    <tr>
                        <td style="padding:10px 0;color:#666;">Time:</td>
                        <td style="padding:10px 0;color:#333;font-weight:600;">${time}</td>
                    </tr>
                    <tr>
                        <td style="padding:10px 0;color:#666;">Status:</td>
                        <td style="padding:10px 0;">
                            <span style="background:#f59e0b;color:white;padding:5px 15px;border-radius:20px;font-size:12px;font-weight:600;">
                                PENDING
                            </span>
                        </td>
                    </tr>
                </table>
            </div>
            
            <p style="color:#666;margin-top:30px;font-size:14px;text-align:center;">
                We will confirm your appointment shortly. You'll receive another email once confirmed.
            </p>
        </div>
        <div style="background:#1a1a2e;color:#888;padding:30px;text-align:center;font-size:14px;">
            <p style="margin:0;"><strong>P&A Institute</strong> - Integrative Medicine</p>
            <p style="margin:10px 0 0;">📞 +234 905 5066 381 | 📍 Lagos, Nigeria</p>
        </div>
    </div>
</body>
</html>
    `;

    return await sendEmail(to, subject, html);
}

// ============================================
// STATUS UPDATE EMAIL
// ============================================
async function sendStatusUpdate(to, appointment) {
    const status = appointment.status || 'updated';
    const name = appointment.full_name || appointment.fullName || 'Patient';
    
    const templates = {
        'confirmed': {
            subject: '✅ Appointment Confirmed - P&A Institute',
            icon: '✅',
            title: 'Appointment Confirmed!',
            message: 'Great news! Your appointment has been confirmed.',
            color: '#10b981'
        },
        'cancelled': {
            subject: '❌ Appointment Cancelled - P&A Institute',
            icon: '❌',
            title: 'Appointment Cancelled',
            message: 'Your appointment has been cancelled.',
            color: '#ef4444'
        },
        'completed': {
            subject: '🎉 Thank You - P&A Institute',
            icon: '🎉',
            title: 'Thank You!',
            message: 'Your appointment has been completed. Thank you for visiting us!',
            color: '#3b82f6'
        },
        'pending': {
            subject: '📅 Appointment Pending - P&A Institute',
            icon: '📅',
            title: 'Appointment Pending',
            message: 'Your appointment is pending confirmation.',
            color: '#f59e0b'
        }
    };

    const template = templates[status] || templates['pending'];

    const html = `
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
                Hi <strong>${name}</strong>, ${template.message}
            </p>
            
            <div style="background:#f8fafc;border-radius:12px;padding:25px;margin:20px 0;">
                <h3 style="margin:0 0 20px;color:#333;border-bottom:2px solid ${template.color};padding-bottom:10px;">
                    Appointment Details
                </h3>
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="padding:10px 0;color:#666;width:40%;">Service:</td>
                        <td style="padding:10px 0;color:#333;font-weight:600;">${appointment.service || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding:10px 0;color:#666;">Date:</td>
                        <td style="padding:10px 0;color:#333;font-weight:600;">${appointment.date || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding:10px 0;color:#666;">Time:</td>
                        <td style="padding:10px 0;color:#333;font-weight:600;">${appointment.time || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding:10px 0;color:#666;">Status:</td>
                        <td style="padding:10px 0;">
                            <span style="background:${template.color};color:white;padding:5px 15px;border-radius:20px;font-size:12px;font-weight:600;text-transform:uppercase;">
                                ${status}
                            </span>
                        </td>
                    </tr>
                </table>
            </div>
            
            ${status === 'confirmed' ? `
            <div style="background:#f0fdfa;border-left:4px solid #14b8a6;padding:15px 20px;margin:20px 0;border-radius:0 8px 8px 0;">
                <strong>📍 Reminder:</strong><br>
                Please arrive 15 minutes before your scheduled time.<br>
                Location: No 8 Animashaun Cl, Lagos
            </div>
            ` : ''}
            
            ${status === 'cancelled' ? `
            <div style="text-align:center;margin:30px 0;">
                <a href="https://my-pa-health.vercel.app" style="display:inline-block;background:#14b8a6;color:white;padding:14px 30px;text-decoration:none;border-radius:8px;font-weight:600;">
                    Book New Appointment →
                </a>
            </div>
            ` : ''}
            
            <p style="color:#666;margin-top:30px;font-size:14px;text-align:center;">
                Questions? Contact us at miniquehairs@gmail.com
            </p>
        </div>
        <div style="background:#1a1a2e;color:#888;padding:30px;text-align:center;font-size:14px;">
            <p style="margin:0;"><strong>P&A Institute</strong> - Integrative Medicine</p>
            <p style="margin:10px 0 0;">📞 +234 905 5066 381 | 📍 Lagos, Nigeria</p>
        </div>
    </div>
</body>
</html>
    `;

    return await sendEmail(to, template.subject, html);
}

// ============================================
// WELCOME EMAIL
// ============================================
async function sendWelcomeEmail(to, name) {
    const subject = '🏥 Welcome to P&A Institute!';
    const html = `
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
            <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;">Your Health is Our Priority</p>
        </div>
        <div style="padding:40px 30px;">
            <h2 style="margin:0 0 20px;">Hello ${name}! 👋</h2>
            
            <div style="background:#f0fdfa;border-left:4px solid #14b8a6;padding:20px;margin:20px 0;border-radius:0 8px 8px 0;">
                <strong>Your account has been created successfully!</strong><br>
                You can now access all our healthcare services online.
            </div>
            
            <h3 style="margin:30px 0 15px;">What you can do:</h3>
            <ul style="color:#333;line-height:2;">
                <li>📅 Book appointments with our specialists</li>
                <li>💊 Access various healthcare services</li>
                <li>📱 Manage your health 24/7</li>
            </ul>
            
            <div style="text-align:center;margin:30px 0;">
                <a href="https://my-pa-health.vercel.app" style="display:inline-block;background:#14b8a6;color:white;padding:14px 30px;text-decoration:none;border-radius:8px;font-weight:600;">
                    Visit Dashboard →
                </a>
            </div>
        </div>
        <div style="background:#1a1a2e;color:#888;padding:30px;text-align:center;font-size:14px;">
            <p style="margin:0;"><strong>P&A Institute</strong> - Integrative Medicine</p>
            <p style="margin:10px 0 0;">© 2025 All rights reserved</p>
        </div>
    </div>
</body>
</html>
    `;

    return await sendEmail(to, subject, html);
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
    sendEmail,
    sendAppointmentConfirmation,
    sendStatusUpdate,
    sendWelcomeEmail
};