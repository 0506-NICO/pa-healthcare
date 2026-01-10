// ============================================
// APPOINTMENTS ROUTES - WITH RESEND EMAIL
// ============================================

const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");
require("dotenv").config();

// Resend Email
let resend = null;
const FROM_EMAIL =
    process.env.FROM_EMAIL || "P&A Institute <onboarding@resend.dev>";
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log("   ↳ Appointments: Email service ready");
}

// Supabase
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = (
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
)?.trim();
let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("   ↳ Appointments: Supabase connected");
}

let appointments = [];

// Helper to get supabase instance
const getSupabase = (req) => {
    return req.app.locals.supabase || supabase;
};

// ============================================
// SEND EMAIL FUNCTION
// ============================================
const sendAppointmentEmail = async (appointment, type) => {
    if (!resend) {
        console.log("⚠️ No Resend client");
        return { success: false };
    }

    const templates = {
        booked: {
            subject: "📅 Appointment Booked - P&A Institute",
            icon: "📅",
            color: "#f59e0b",
            title: "Appointment Booked!",
            message:
                "Your appointment has been successfully booked and is pending confirmation.",
        },
        confirmed: {
            subject: "✅ Appointment Confirmed - P&A Institute",
            icon: "✅",
            color: "#10b981",
            title: "Appointment Confirmed!",
            message: "Great news! Your appointment has been confirmed.",
        },
        cancelled: {
            subject: "❌ Appointment Cancelled - P&A Institute",
            icon: "❌",
            color: "#ef4444",
            title: "Appointment Cancelled",
            message: "Your appointment has been cancelled.",
        },
        completed: {
            subject: "🎉 Appointment Completed - P&A Institute",
            icon: "🎉",
            color: "#3b82f6",
            title: "Thank You!",
            message: "Your appointment has been completed.",
        },
    };

    const t = templates[type] || templates.booked;

    try {
        const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: appointment.email,
            subject: t.subject,
            html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
    <div style="max-width:600px;margin:0 auto;background:white;">
        <div style="background:linear-gradient(135deg,#0d9488,#14b8a6);padding:40px 30px;text-align:center;">
            <h1 style="color:white;margin:0;">🏥 P&A Institute</h1>
        </div>
        <div style="padding:40px 30px;text-align:center;">
            <span style="font-size:60px;">${t.icon}</span>
            <h2 style="color:${t.color};">${t.title}</h2>
            <p>${t.message}</p>
            <div style="background:#f8fafc;border-radius:12px;padding:25px;margin:20px 0;text-align:left;">
                <p><strong>Patient:</strong> ${appointment.full_name || appointment.fullName}</p>
                <p><strong>Service:</strong> ${appointment.service}</p>
                <p><strong>Date:</strong> ${appointment.date}</p>
                <p><strong>Time:</strong> ${appointment.time}</p>
                <p><strong>Status:</strong> <span style="background:${t.color};color:white;padding:5px 15px;border-radius:20px;font-size:12px;">${type.toUpperCase()}</span></p>
            </div>
        </div>
        <div style="background:#1a1a2e;color:#888;padding:20px;text-align:center;font-size:14px;">
            <p style="margin:0;">P&A Institute of Integrative Medicine</p>
            <p style="margin:5px 0 0;">📞 +234 905 5066 381 | Lagos, Nigeria</p>
        </div>
    </div>
</body>
</html>`,
        });

        if (error) {
            console.log(`❌ Email error:`, error.message);
            return { success: false };
        }
        console.log(`📧 ${type} email sent to:`, appointment.email);
        return { success: true };
    } catch (err) {
        console.log(`❌ Email failed:`, err.message);
        return { success: false };
    }
};

// ============================================
// CREATE APPOINTMENT
// ============================================
router.post("/", async (req, res) => {
    try {
        const {
            fullName,
            full_name,
            email,
            phone,
            service,
            date,
            time,
            message,
        } = req.body;
        const patientName = fullName || full_name;

        if (!patientName || !email || !service || !date || !time) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Name, email, service, date and time are required",
                });
        }

        const appointmentData = {
            id:
                "APT_" +
                Date.now() +
                "_" +
                Math.random().toString(36).substr(2, 6),
            full_name: patientName.trim(),
            email: email.toLowerCase().trim(),
            phone: phone || "",
            service,
            date,
            time,
            message: message || "",
            status: "pending",
            created_at: new Date().toISOString(),
        };

        // Save to Supabase
        const db = getSupabase(req);
        if (db) {
            const { error } = await db
                .from("appointments")
                .insert([appointmentData]);
            if (error) {
                console.error("❌ DB error:", error.message);
            } else {
                console.log("✅ Saved to Supabase:", appointmentData.id);
            }
        }
        appointments.push(appointmentData);

        console.log("✅ Appointment created:", appointmentData.id);

        // Send email
        sendAppointmentEmail(appointmentData, "booked");

        res.status(201).json({
            success: true,
            message: "Appointment booked successfully!",
            data: appointmentData,
        });
    } catch (error) {
        console.error("Create appointment error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// GET ALL APPOINTMENTS
// ============================================
router.get("/", async (req, res) => {
    try {
        let allAppointments = [];
        const db = getSupabase(req);

        if (db) {
            const { data, error } = await db
                .from("appointments")
                .select("*")
                .order("created_at", { ascending: false });
            if (data) allAppointments = data;
            if (error) console.error("DB error:", error.message);
        }

        res.json({ success: true, data: allAppointments });
    } catch (error) {
        console.error("Get appointments error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// GET USER'S APPOINTMENTS
// ============================================
router.get("/user/:email", async (req, res) => {
    try {
        const email = req.params.email.toLowerCase().trim();
        let userAppointments = [];
        const db = getSupabase(req);

        if (db) {
            const { data, error } = await db
                .from("appointments")
                .select("*")
                .eq("email", email)
                .order("created_at", { ascending: false });
            if (data) userAppointments = data;
            if (error) console.error("DB error:", error.message);
        }

        res.json({ success: true, data: userAppointments });
    } catch (error) {
        console.error("Get user appointments error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// UPDATE APPOINTMENT STATUS
// ============================================
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res
                .status(400)
                .json({ success: false, message: "Status is required" });
        }

        let appointment = null;
        const db = getSupabase(req);

        if (db) {
            const { data, error } = await db
                .from("appointments")
                .update({ status, updated_at: new Date().toISOString() })
                .eq("id", id)
                .select()
                .single();
            if (data) appointment = data;
            if (error) console.error("DB update error:", error.message);
        }

        if (!appointment) {
            return res
                .status(404)
                .json({ success: false, message: "Appointment not found" });
        }

        console.log(`✅ Appointment ${id} updated to: ${status}`);

        // Send status email
        sendAppointmentEmail(appointment, status);

        res.json({
            success: true,
            message: `Appointment ${status}!`,
            data: appointment,
        });
    } catch (error) {
        console.error("Update appointment error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// DELETE APPOINTMENT
// ============================================
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const db = getSupabase(req);

        if (db) {
            const { error } = await db
                .from("appointments")
                .delete()
                .eq("id", id);
            if (error) console.error("DB delete error:", error.message);
        }

        console.log("✅ Appointment deleted:", id);
        res.json({ success: true, message: "Appointment deleted" });
    } catch (error) {
        console.error("Delete appointment error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
