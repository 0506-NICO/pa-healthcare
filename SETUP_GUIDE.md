# 🚀 COMPLETE SETUP GUIDE FOR VS CODE

## ✅ YOUR PACKAGE IS READY!

You have the **HEALTHCARE-COMPLETE-SYSTEM** folder below with everything you need!

---

## 📁 WHAT'S INCLUDED

```
HEALTHCARE-COMPLETE-SYSTEM/
├── 📂 backend/               ← Node.js API (46+ endpoints)
│   ├── routes/              ← 8 API modules
│   │   ├── auth.js          (Login, Register, Password Reset)
│   │   ├── users.js         (User management)
│   │   ├── appointments.js  (Booking system)
│   │   ├── payments.js      (Payment processing)
│   │   ├── products.js      (E-commerce products)
│   │   ├── orders.js        (Order management)
│   │   ├── admin.js         (Admin dashboard)
│   │   └── email.js         (Email API)
│   ├── services/            
│   │   ├── email.js         (SendGrid/SMTP)
│   │   └── sms.js           (Twilio/AfricasTalking)
│   ├── middleware/
│   │   └── auth.js          (JWT authentication)
│   ├── config/
│   │   └── database.js      (Firebase/Supabase)
│   ├── logs/                (Security logs)
│   ├── server.js            ← MAIN SERVER FILE
│   ├── package.json         ← Dependencies
│   ├── .env.example         ← Configuration template
│   └── .gitignore
│
├── 📂 frontend/              ← Complete Website
│   ├── css/
│   │   ├── core-styles.css
│   │   └── healthcare-theme.css
│   ├── js/
│   │   ├── core-functions.js
│   │   └── healthcare-app.js (Secure API integration)
│   ├── config/
│   │   └── config.js
│   ├── index.html           ← MAIN HTML FILE
│   └── [Documentation files]
│
├── 📂 database/              ← Database Setup
│   └── DATABASE_SETUP.md    (Firebase & Supabase guides)
│
├── 📂 deployment/            ← Deployment Guides
│   └── DEPLOYMENT_GUIDE.md  (Netlify, Heroku, etc.)
│
├── 📂 security/              ← Security Docs
│   └── SECURITY_GUIDE.md    (9.5/10 security score)
│
├── 📂 documentation/         ← All Guides
│   ├── BACKEND_SUMMARY.md
│   └── INTEGRATION_GUIDE.md
│
└── 📄 README.md             ← START HERE!
```

---

## 📥 STEP 1: DOWNLOAD THE FOLDER

**Look below this message** - you should see a download link for:
### **HEALTHCARE-COMPLETE-SYSTEM** folder

Click it to download!

---

## 💻 STEP 2: EXTRACT & OPEN IN VS CODE

### **Windows:**
```
1. Go to Downloads folder
2. Right-click HEALTHCARE-COMPLETE-SYSTEM.zip
3. Click "Extract All"
4. Extract to: C:\Projects\HEALTHCARE-COMPLETE-SYSTEM
5. Right-click the extracted folder
6. Select "Open with Code"
```

### **Mac:**
```
1. Go to Downloads folder
2. Double-click HEALTHCARE-COMPLETE-SYSTEM.zip (auto-extracts)
3. Move folder to: ~/Projects/HEALTHCARE-COMPLETE-SYSTEM
4. Right-click folder
5. Select "Open with Visual Studio Code"
```

---

## ⚙️ STEP 3: INSTALL NODE.JS (If Not Installed)

1. Go to: **https://nodejs.org**
2. Download **LTS version** (recommended)
3. Run installer
4. Accept defaults
5. **Restart VS Code**

**Verify installation:**
```bash
# Open Terminal in VS Code (Ctrl + `)
node --version
npm --version
```

You should see version numbers like:
```
v18.17.0
9.6.7
```

---

## 🔧 STEP 4: SETUP BACKEND (10 minutes)

### **1. Open Terminal in VS Code**
Press: **Ctrl + `** (backtick key)

### **2. Navigate to backend:**
```bash
cd backend
```

### **3. Install dependencies:**
```bash
npm install
```

**This will install:**
- express (web framework)
- helmet (security)
- cors (API access)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- And 15+ more security packages!

**Wait 1-2 minutes** for installation to complete.

### **4. Create .env file:**

**In VS Code Explorer:**
```
1. Click on "backend" folder
2. Right-click → New File
3. Name it: .env
4. Copy content from .env.example
5. Paste into .env
```

**Or use terminal:**
```bash
# While in backend folder
cp .env.example .env
```

### **5. Edit .env file:**

**Click on .env file and update these:**

```env
# REQUIRED - Change these!
NODE_ENV=development
PORT=5000

# Generate a long random string (or use this)
JWT_SECRET=my_super_secret_jwt_key_12345678901234567890_change_this_in_production
SESSION_SECRET=my_session_secret_key_98765432109876543210

# Your frontend URL (for now)
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5500
FRONTEND_URL=http://localhost:3000

# PAYMENT - Get from paystack.com (FREE account)
PAYSTACK_SECRET_KEY=sk_test_your_test_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_test_key_here

# EMAIL - Get from sendgrid.com (FREE 100 emails/day)
SENDGRID_API_KEY=SG.your_api_key_here
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Healthcare Plus

# DATABASE - Setup later (we'll cover this)
FIREBASE_PROJECT_ID=
SUPABASE_URL=

# Other settings
BUSINESS_NAME=Healthcare Plus
CURRENCY=NGN
```

**Save:** Ctrl + S

### **6. Start backend server:**
```bash
npm run dev
```

**You should see:**
```
╔══════════════════════════════════════════╗
║   🔒 SECURE BACKEND SERVER RUNNING       ║
║   Port: 5000                             ║
║   Environment: development               ║
║   Security: MAXIMUM                      ║
╚══════════════════════════════════════════╝

✅ Helmet (Security Headers)
✅ CORS (Strict)
✅ Rate Limiting
...
```

**✅ Backend is running!** Keep this terminal open.

---

## 🌐 STEP 5: SETUP FRONTEND (5 minutes)

### **1. Open NEW Terminal**
Click the **+** icon in terminal panel (top right)

### **2. Navigate to frontend:**
```bash
cd frontend
```

### **3. Install Live Server Extension**

**In VS Code:**
```
1. Click Extensions icon (Ctrl + Shift + X)
2. Search: "Live Server"
3. Install "Live Server" by Ritwick Dey
4. Wait for installation
```

### **4. Open website:**

**Method 1: Using Live Server (Best)**
```
1. In Explorer, right-click on index.html
2. Select "Open with Live Server"
3. Browser opens automatically!
```

**Method 2: Direct Open**
```
1. In Explorer, right-click index.html
2. Click "Reveal in File Explorer"
3. Double-click index.html
```

**✅ Website is now running!**
URL: http://127.0.0.1:5500 or http://localhost:5500

---

## 🧪 STEP 6: TEST IT!

### **Test Backend:**

Open browser and go to:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "OK",
  "message": "Secure backend server running",
  "timestamp": "2025-11-15..."
}
```

### **Test Frontend:**

Go to: http://127.0.0.1:5500

**Try these:**
1. ✅ Click "Book Appointment"
2. ✅ Scroll through services
3. ✅ Click "Login" (modal should open)
4. ✅ Fill forms

**Note:** Payment won't work yet - need Paystack setup (next step)

---

## 💳 STEP 7: SETUP PAYMENTS (OPTIONAL - 10 minutes)

### **1. Create Paystack Account:**
```
1. Go to: https://paystack.com
2. Click "Create Free Account"
3. Verify your email
4. Complete business verification
```

### **2. Get API Keys:**
```
1. Login to Paystack Dashboard
2. Go to Settings → API Keys & Webhooks
3. Copy:
   - Test Secret Key (starts with sk_test_)
   - Test Public Key (starts with pk_test_)
```

### **3. Update .env file:**
```env
PAYSTACK_SECRET_KEY=sk_test_your_actual_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_actual_key_here
```

### **4. Update frontend:**

Edit `frontend/js/healthcare-app.js`:

Find line ~280 and update:
```javascript
key: 'pk_test_your_actual_key_here',  // Add your real key
```

### **5. Restart backend:**
```bash
# In backend terminal (Ctrl + C to stop)
npm run dev
```

### **6. Test payment:**
```
1. Book an appointment
2. Use Paystack test card:
   - Card: 4084 0840 8408 4081
   - CVV: 408
   - Expiry: 12/25
   - PIN: 0000
```

---

## 📊 STEP 8: SETUP DATABASE (OPTIONAL - 15 minutes)

**You can skip this for now** - the system works without database for testing.

### **Option 1: Firebase (Easier)**

1. Go to: https://console.firebase.google.com
2. Create new project
3. Enable Firestore Database
4. Get credentials
5. Update .env

**Full guide:** `database/DATABASE_SETUP.md`

### **Option 2: Supabase (SQL)**

1. Go to: https://supabase.com
2. Create new project
3. Get credentials
4. Update .env

**Full guide:** `database/DATABASE_SETUP.md`

---

## 🎨 STEP 9: CUSTOMIZE (5 minutes)

### **Update Business Name:**

**Frontend - index.html:**
```html
Line 30: <h1>Healthcare Plus</h1>
→ Change to: <h1>Your Business Name</h1>
```

**Backend - .env:**
```env
BUSINESS_NAME=Your Business Name
FROM_NAME=Your Business Name
```

### **Update Colors:**

**frontend/css/healthcare-theme.css:**
```css
Line 10-14: (Change these colors)
--primary: #2563eb;     → Your brand color
--secondary: #3b82f6;   → Your secondary color
```

---

## ✅ QUICK REFERENCE

### **Common Terminal Commands:**
```bash
# Navigate
cd backend          # Go to backend
cd frontend         # Go to frontend
cd ..              # Go up one level

# Backend
npm install        # Install packages
npm run dev        # Start development server
npm start          # Start production server

# Stop server
Ctrl + C           # Stop current process
```

### **VS Code Shortcuts:**
```
Ctrl + `           # Open terminal
Ctrl + B           # Toggle sidebar
Ctrl + P           # Quick file search
Ctrl + S           # Save file
Ctrl + F           # Find in file
```

---

## 🆘 TROUBLESHOOTING

### **"npm not found"**
→ Node.js not installed. Install from nodejs.org

### **"Port 5000 already in use"**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID [PID] /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### **"Cannot find module"**
```bash
cd backend
rm -rf node_modules
npm install
```

### **Frontend not loading**
→ Make sure Live Server is running
→ Check browser console (F12)
→ Try different port

---

## 📚 NEXT STEPS

1. ✅ **Read** `README.md` (master guide)
2. ✅ **Setup** Paystack account
3. ✅ **Setup** database (Firebase/Supabase)
4. ✅ **Customize** your business details
5. ✅ **Test** all features
6. ✅ **Deploy** to production (see deployment/DEPLOYMENT_GUIDE.md)

---

## 🎉 YOU'RE ALL SET!

**Your development environment is ready!**

**What you have:**
- ✅ Complete backend API
- ✅ Beautiful frontend
- ✅ Maximum security
- ✅ Payment integration ready
- ✅ Production-ready code

**Start building your empire! 🚀**

---

**Need help? Check the documentation folder for detailed guides!**
