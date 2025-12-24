# 🔗 FRONTEND + BACKEND INTEGRATION GUIDE

## 📋 Complete System Overview

You now have:
1. ✅ **Frontend** - Healthcare website (HTML/CSS/JS)
2. ✅ **Backend** - Node.js API server
3. 📝 **This Guide** - How to connect them!

---

## 🎯 INTEGRATION STEPS

### STEP 1: Setup Backend (30 minutes)

```bash
# 1. Navigate to backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Edit .env with your credentials
# Required:
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_super_secret_key_12345
PAYSTACK_SECRET_KEY=sk_test_your_key
SENDGRID_API_KEY=your_sendgrid_key

# 5. Choose database: Firebase OR Supabase
# For Firebase:
FIREBASE_PROJECT_ID=your-project-id
# OR For Supabase:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key

# 6. Start backend server
npm run dev
```

Backend will run on: **http://localhost:5000**

---

### STEP 2: Update Frontend to Connect to Backend

#### A. Update Healthcare App JavaScript

Replace the frontend `js/healthcare-app.js` with API calls:

```javascript
// healthcare-app.js - UPDATED VERSION

const API_URL = 'http://localhost:5000/api'; // Change for production
let authToken = localStorage.getItem('authToken');

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

async function handleSignup(e) {
    e.preventDefault();
    
    const form = e.target;
    const data = {
        name: form.querySelector('input[type="text"]').value,
        email: form.querySelector('input[type="email"]').value,
        phone: form.querySelector('input[type="tel"]').value,
        password: form.querySelector('input[type="password"]').value
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    const loading = showLoading(submitBtn);

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            authToken = result.data.token;
            localStorage.setItem('authToken', authToken);
            closeModal();
            showNotification('Account created successfully!', 'success');
            updateUIForLoggedInUser(result.data.user);
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('Error creating account', 'error');
    } finally {
        loading.hide();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const data = {
        email: form.querySelector('input[type="email"]').value,
        password: form.querySelector('input[type="password"]').value
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    const loading = showLoading(submitBtn);

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            authToken = result.data.token;
            localStorage.setItem('authToken', authToken);
            closeModal();
            showNotification('Login successful!', 'success');
            updateUIForLoggedInUser(result.data.user);
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Error logging in', 'error');
    } finally {
        loading.hide();
    }
}

// ============================================
// APPOINTMENT FUNCTIONS
// ============================================

async function handleAppointmentSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const appointmentData = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        service: formData.get('service').split('-')[0],
        date: formData.get('date'),
        time: formData.get('time'),
        message: formData.get('message')
    };

    const amount = parseInt(formData.get('service').split('-')[1]);

    const submitBtn = form.querySelector('button[type="submit"]');
    const loading = showLoading(submitBtn);

    try {
        // Create appointment
        const response = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                ...(authToken && { 'Authorization': `Bearer ${authToken}` })
            },
            body: JSON.stringify(appointmentData)
        });

        const result = await response.json();

        if (result.success) {
            // Initialize payment
            await initiatePayment({
                email: appointmentData.email,
                amount: amount,
                reference: `apt_${result.data.id}_${Date.now()}`,
                metadata: {
                    appointmentId: result.data.id,
                    service: appointmentData.service,
                    date: appointmentData.date,
                    time: appointmentData.time
                }
            });
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Appointment error:', error);
        showNotification('Error creating appointment', 'error');
    } finally {
        loading.hide();
    }
}

// ============================================
// PAYMENT FUNCTIONS
// ============================================

async function initiatePayment(data) {
    try {
        // Initialize payment with backend
        const response = await fetch(`${API_URL}/payments/initialize/paystack`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            // Use Paystack popup
            const handler = PaystackPop.setup({
                key: 'pk_test_YOUR_PUBLIC_KEY', // Replace with your public key
                email: data.email,
                amount: data.amount * 100,
                ref: data.reference,
                metadata: data.metadata,
                callback: function(response) {
                    verifyPayment(response.reference);
                },
                onClose: function() {
                    showNotification('Payment cancelled', 'error');
                }
            });
            
            handler.openIframe();
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Payment initialization error:', error);
        showNotification('Error initializing payment', 'error');
    }
}

async function verifyPayment(reference) {
    try {
        const response = await fetch(`${API_URL}/payments/verify/paystack/${reference}`);
        const result = await response.json();

        if (result.success && result.data.status === 'success') {
            showNotification('Payment successful! Appointment confirmed.', 'success');
            document.getElementById('appointmentForm').reset();
            updateTotalAmount(0);
            
            // Show confirmation
            showAppointmentConfirmation(result.data);
        } else {
            showNotification('Payment verification failed', 'error');
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        showNotification('Error verifying payment', 'error');
    }
}
```

---

### STEP 3: Add Paystack Script to Frontend

In `index.html`, add before `</body>`:

```html
<!-- Paystack Inline JS -->
<script src="https://js.paystack.co/v1/inline.js"></script>
```

---

### STEP 4: Update API URL for Production

When deploying, update the API_URL:

```javascript
// For production
const API_URL = 'https://your-backend.herokuapp.com/api';

// OR use environment detection
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://your-backend.herokuapp.com/api';
```

---

## 🚀 DEPLOYMENT

### Backend Deployment (Heroku)

```bash
# 1. Login to Heroku
heroku login

# 2. Create app
heroku create your-backend-app

# 3. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret
heroku config:set PAYSTACK_SECRET_KEY=sk_live_xxx
heroku config:set SENDGRID_API_KEY=xxx

# 4. Deploy
git push heroku main

# 5. Your backend is live!
# https://your-backend-app.herokuapp.com
```

### Frontend Deployment (Netlify)

```bash
# 1. Update API_URL in js/healthcare-app.js
const API_URL = 'https://your-backend-app.herokuapp.com/api';

# 2. Go to netlify.com
# 3. Drag and drop your frontend folder
# 4. Done! Your frontend is live
```

---

## 🔒 CORS Configuration

Update backend `server.js`:

```javascript
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://your-frontend.netlify.app'
    ],
    credentials: true
}));
```

---

## 🧪 TESTING THE INTEGRATION

### Test 1: Check Backend Health
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Backend server is running"
}
```

### Test 2: Create User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+234-800-123-4567"
  }'
```

### Test 3: Create Appointment
```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+234-800-123-4567",
    "service": "General Consultation",
    "date": "2025-12-01",
    "time": "10:00"
  }'
```

---

## 📊 COMPLETE WORKFLOW

```
USER VISITS WEBSITE
      ↓
CLICKS "BOOK APPOINTMENT"
      ↓
FILLS FORM
      ↓
SUBMITS FORM
      ↓
Frontend → POST /api/appointments → Backend
      ↓
Backend creates appointment in Database
      ↓
Backend returns appointment ID
      ↓
Frontend → POST /api/payments/initialize/paystack
      ↓
Backend initializes payment
      ↓
Paystack popup opens
      ↓
User pays
      ↓
Payment webhook → Backend
      ↓
Backend updates appointment status
      ↓
Backend sends confirmation email
      ↓
Frontend shows success message
      ↓
DONE! ✅
```

---

## 🎯 CHECKLIST

### Backend Setup
- [ ] npm install
- [ ] Create .env file
- [ ] Add database credentials
- [ ] Add payment keys
- [ ] Add email keys
- [ ] Start server (npm run dev)
- [ ] Test health endpoint

### Frontend Updates
- [ ] Update API_URL
- [ ] Add Paystack script
- [ ] Update auth functions
- [ ] Update appointment functions
- [ ] Test locally

### Deployment
- [ ] Deploy backend to Heroku
- [ ] Deploy frontend to Netlify
- [ ] Update CORS settings
- [ ] Update API_URL to production
- [ ] Test live website
- [ ] Test payment flow

---

## 🆘 TROUBLESHOOTING

**"Network Error" or "Failed to fetch"**
- Check if backend is running (http://localhost:5000/api/health)
- Verify API_URL is correct
- Check CORS settings

**"Unauthorized" Error**
- Check if JWT token is being sent
- Verify JWT_SECRET matches

**Payment Not Working**
- Verify Paystack keys (public and secret)
- Check if webhook URL is accessible
- Test with Paystack test cards

**Database Errors**
- Verify Firebase/Supabase credentials
- Check if database is created
- Review console logs

---

## 📚 NEXT STEPS

1. ✅ Setup backend
2. ✅ Connect frontend
3. ✅ Test locally
4. ✅ Deploy both
5. ✅ Test production
6. 🎉 Go live!

---

**You're ready to launch! 🚀**

Need help? Check:
- Backend README.md
- Frontend QUICK_START.md
- Your console logs (F12)
