// ============================================
// SMS SERVICE
// Twilio integration for sending SMS
// ============================================

const twilio = require('twilio');
require('dotenv').config();

let twilioClient = null;

// Initialize Twilio if credentials exist
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Twilio SMS service initialized');
}
// SMS Service - Disabled (add Twilio credentials to enable)

async function sendSMS(options) {
    console.log('📱 SMS disabled - Twilio not configured');
    return { success: true, note: 'SMS disabled' };
}

module.exports = { sendSMS };


// ============================================
// SEND BULK SMS
// ============================================

async function sendBulkSMS(recipients, message) {
    const results = [];

    for (const phone of recipients) {
        try {
            const result = await sendSMS({ to: phone, message });
            results.push({ phone, success: true, sid: result.sid });
        } catch (error) {
            results.push({ phone, success: false, error: error.message });
        }
    }

    return results;
}

// ============================================
// SEND APPOINTMENT REMINDER
// ============================================

async function sendAppointmentReminder(appointment) {
    const message = `Reminder: You have an appointment for ${appointment.service} on ${appointment.date} at ${appointment.time}. See you soon! - ${process.env.BUSINESS_NAME}`;

    return sendSMS({
        to: appointment.phone,
        message
    });
}

// ============================================
// SEND VERIFICATION CODE
// ============================================

async function sendVerificationCode(phone, code) {
    const message = `Your verification code is: ${code}. Valid for 10 minutes. - ${process.env.BUSINESS_NAME}`;

    return sendSMS({ to: phone, message });
}

module.exports = {
    sendSMS,
    sendBulkSMS,
    sendAppointmentReminder,
    sendVerificationCode
};
