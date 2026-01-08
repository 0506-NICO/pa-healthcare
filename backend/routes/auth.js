// ============================================
// AUTH ROUTES - WITH RESEND EMAIL
// ============================================

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");
require("dotenv").config();

// Supabase
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = (
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
)?.trim();
let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("   ↳ Auth: Supabase connected");
}

// Resend Email
let resend = null;
const FROM_EMAIL =
    process.env.FROM_EMAIL || "P&A Institute <onboarding@resend.dev>";
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log("   ↳ Auth: Resend email ready ✓");
} else {
    console.log("   ↳ Auth: No RESEND_API_KEY - emails disabled");
}

let users = [];

const JWT_SECRET = process.env.JWT_SECRET || "pa-healthcare-2025-secret-key";
const JWT_EXPIRES_IN = "7d";

// ============================================
// WELCOME EMAIL
// ============================================
const sendWelcomeEmail = async (user) => {
    if (!resend) return { success: false };

    try {
        const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: user.email,
            subject: "🏥 Welcome to P&A Institute!",
            html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
    <div style="max-width:600px;margin:0 auto;background:white;">
        <div style="background:linear-gradient(135deg,#0d9488,#14b8a6);padding:40px 30px;text-align:center;">
            <h1 style="color:white;margin:0;">🏥 Welcome to P&A Institute!</h1>
            <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;">Your Health is Our Priority</p>
        </div>
        <div style="padding:40px 30px;">
            <h2 style="margin:0 0 20px;">Hello ${user.name}! 👋</h2>
            <div style="background:#f0fdfa;border-left:4px solid #14b8a6;padding:20px;margin:20px 0;">
                <strong>Your account has been created successfully!</strong><br>
                You can now book appointments and access our healthcare services.
            </div>
            <div style="text-align:center;margin:30px 0;">
                <a href="https://my-pa-health.vercel.app" style="display:inline-block;background:#14b8a6;color:white;padding:14px 30px;text-decoration:none;border-radius:8px;font-weight:600;">Visit Dashboard →</a>
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
            console.log("⚠️ Welcome email failed:", error.message);
            return { success: false };
        }
        console.log("📧 Welcome email sent to:", user.email);
        return { success: true };
    } catch (err) {
        console.log("⚠️ Welcome email error:", err.message);
        return { success: false };
    }
};

// ============================================
// REGISTER
// ============================================
router.post("/register", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !password) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Name, email and password are required",
                });
        }

        const normalizedEmail = email.toLowerCase().trim();

        if (supabase) {
            const { data } = await supabase
                .from("users")
                .select("id")
                .eq("email", normalizedEmail)
                .single();
            if (data) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message: "User already exists with this email",
                    });
            }
        }

        if (users.find((u) => u.email === normalizedEmail)) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "User already exists with this email",
                });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            id:
                "USR_" +
                Date.now() +
                "_" +
                Math.random().toString(36).substr(2, 6),
            name: name.trim(),
            email: normalizedEmail,
            phone: phone || "",
            password: hashedPassword,
            role: "user",
            status: "active",
            created_at: new Date().toISOString(),
        };

        if (supabase) {
            const { error } = await supabase.from("users").insert([userData]);
            if (error) console.error("DB error:", error.message);
        }
        users.push(userData);

        const token = jwt.sign(
            { id: userData.id, email: userData.email, role: userData.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN },
        );

        console.log("✅ Registered:", normalizedEmail);

        // Send welcome email
        sendWelcomeEmail(userData);

        const { password: _, ...userWithoutPassword } = userData;
        res.status(201).json({
            success: true,
            message: "Registration successful!",
            data: { user: userWithoutPassword, token },
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// LOGIN
// ============================================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Email and password are required",
                });
        }

        const normalizedEmail = email.toLowerCase().trim();
        let user = null;

        if (supabase) {
            const { data } = await supabase
                .from("users")
                .select("*")
                .eq("email", normalizedEmail)
                .single();
            if (data) user = data;
        }

        if (!user) {
            user = users.find((u) => u.email === normalizedEmail);
        }

        if (!user) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid email or password" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN },
        );

        console.log("✅ Login:", normalizedEmail);

        const { password: _, ...userWithoutPassword } = user;
        res.json({
            success: true,
            message: "Login successful",
            data: { user: userWithoutPassword, token },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// GET ME
// ============================================
router.get("/me", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res
                .status(401)
                .json({ success: false, message: "No token" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        let user = null;
        if (supabase) {
            const { data } = await supabase
                .from("users")
                .select("id, name, email, phone, role")
                .eq("id", decoded.id)
                .single();
            user = data;
        }
        if (!user) {
            const mem = users.find((u) => u.id === decoded.id);
            if (mem) {
                const { password, ...u } = mem;
                user = u;
            }
        }

        res.json({ success: true, data: user || decoded });
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
});

// ============================================
// LOGOUT
// ============================================
router.post("/logout", (req, res) => {
    res.json({ success: true, message: "Logged out" });
});

module.exports = router;
