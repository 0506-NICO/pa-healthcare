// ============================================
// EMAIL SERVICE - USING RESEND
// ============================================

const { Resend } = require("resend");
require("dotenv").config();

let resend = null;
const FROM_EMAIL =
    process.env.FROM_EMAIL || "P&A Institute <onboarding@resend.dev>";

// Initialize Resend
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log("✅ Resend email service initialized");
} else {
    console.log("⚠️  RESEND_API_KEY not found - emails disabled");
}

// Send Email
async function sendEmail(to, subject, html) {
    if (!resend) {
        console.log("⚠️  Email not configured");
        return { success: false };
    }
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: to,
            subject: subject,
            html: html,
        });
        if (error) {
            console.log("❌ Email error:", error.message);
            return { success: false };
        }
        console.log("📧 Email sent to:", to);
        return { success: true, id: data?.id };
    } catch (error) {
        console.log("❌ Email failed:", error.message);
        return { success: false };
    }
}

// Welcome Email
async function sendWelcomeEmail(user) {
    const html = `
    <div style="font-family:Arial;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:linear-gradient(135deg,#0d9488,#14b8a6);padding:40px;text-align:center;">
            <h1 style="color:#fff;margin:0;">🏥 Welcome to P&A Institute!</h1>
        </div>
        <div style="padding:30px;">
            <h2>Hello ${user.name || "there"}! 👋</h2>
            <p>Your account has been created successfully!</p>
            <a href="https://my-pa-health.vercel.app" style="display:inline-block;background:#14b8a6;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;">Visit Dashboard →</a>
        </div>
    </div>`;
    return sendEmail(user.email, "🏥 Welcome to P&A Institute!", html);
}

// Appointment Confirmation
async function sendAppointmentConfirmation(data) {
    const html = `
    <div style="font-family:Arial;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#0d9488,#14b8a6);padding:40px;text-align:center;">
            <h1 style="color:#fff;">🏥 P&A Institute</h1>
        </div>
        <div style="padding:30px;">
            <h2 style="color:#f59e0b;">📅 Appointment Booked!</h2>
            <p><strong>Patient:</strong> ${data.name || data.fullName}</p>
            <p><strong>Service:</strong> ${data.service}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Reference:</strong> ${data.appointmentId || "N/A"}</p>
        </div>
    </div>`;
    return sendEmail(
        data.to || data.email,
        "📅 Appointment Booked - P&A Institute",
        html,
    );
}

// Status Update
async function sendStatusUpdate(email, appointment) {
    const status = appointment.status || "pending";
    const icons = {
        confirmed: "✅",
        cancelled: "❌",
        completed: "🎉",
        pending: "⏳",
    };
    const html = `
    <div style="font-family:Arial;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#0d9488,#14b8a6);padding:40px;text-align:center;">
            <h1 style="color:#fff;">🏥 P&A Institute</h1>
        </div>
        <div style="padding:30px;">
            <h2>${icons[status] || "📋"} Appointment ${status.toUpperCase()}</h2>
            <p><strong>Patient:</strong> ${appointment.full_name || appointment.fullName || "N/A"}</p>
            <p><strong>Service:</strong> ${appointment.service}</p>
            <p><strong>Date:</strong> ${appointment.date}</p>
            <p><strong>Time:</strong> ${appointment.time}</p>
        </div>
    </div>`;
    return sendEmail(
        email,
        `${icons[status]} Appointment ${status} - P&A Institute`,
        html,
    );
}

// For appointments.js
async function sendAppointmentEmail(appointment, type) {
    if (type === "booked") {
        return sendAppointmentConfirmation({
            to: appointment.email,
            name: appointment.full_name || appointment.fullName,
            service: appointment.service,
            date: appointment.date,
            time: appointment.time,
            appointmentId: appointment.id,
        });
    } else {
        return sendStatusUpdate(appointment.email, {
            ...appointment,
            status: type,
        });
    }
}

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendAppointmentConfirmation,
    sendStatusUpdate,
    sendAppointmentEmail,
};
