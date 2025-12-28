# 🚀 BUSINESS BACKEND - Complete API Server

## 📋 Overview

This is a **production-ready, reusable backend** built with Node.js and Express.js that works for:
- 🏥 **Healthcare** (appointments, consultations)
- 🛒 **E-commerce** (products, orders)
- 👗 **Fashion Design** (bookings, custom orders)
- 💼 **Any Service Business**

## ✨ Features

### Core Features
- ✅ RESTful API architecture
- ✅ JWT authentication & authorization
- ✅ Role-based access control (User/Admin)
- ✅ Payment integration (Paystack, Flutterwave)
- ✅ Email service (SendGrid, Mailgun, SMTP)
- ✅ SMS service (Twilio)
- ✅ Database abstraction (Firebase/Supabase)
- ✅ Rate limiting & security
- ✅ Error handling
- ✅ Webhook support

### Business Modules
- 👤 **User Management** - Registration, login, profiles
- 📅 **Appointments** - Booking system for healthcare/services
- 💳 **Payments** - Complete payment processing
- 📦 **Products** - E-commerce product catalog
- 🛍️ **Orders** - Order management system
- 📧 **Email** - Automated email notifications
- 📊 **Admin Dashboard** - Statistics and analytics

## 📁 Project Structure

```
backend/
├── server.js                  # Main server file
├── package.json               # Dependencies
├── .env.example               # Environment variables template
│
├── config/
│   └── database.js            # Database configuration (Firebase/Supabase)
│
├── routes/
│   ├── auth.js                # Authentication routes
│   ├── users.js               # User management
│   ├── appointments.js        # Appointment booking
│   ├── payments.js            # Payment processing
│   ├── products.js            # Product management (e-commerce)
│   ├── orders.js              # Order management (e-commerce)
│   ├── admin.js               # Admin dashboard
│   └── email.js               # Email sending
│
├── middleware/
│   └── auth.js                # Authentication middleware
│
└── services/
    ├── email.js               # Email service (SendGrid/SMTP)
    └── sms.js                 # SMS service (Twilio)
```

## 🚀 Quick Start

### 1. Installation

```bash
# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### 3. Database Setup

**Option A: Firebase**
1. Go to https://console.firebase.google.com
2. Create a new project
3. Go to Project Settings → Service Accounts
4. Generate new private key
5. Add credentials to `.env`

**Option B: Supabase**
1. Go to https://supabase.com
2. Create a new project
3. Get your URL and API keys
4. Add to `.env`

### 4. Payment Setup

**Paystack:**
1. Go to https://paystack.com
2. Get your Secret Key
3. Add to `.env`: `PAYSTACK_SECRET_KEY=sk_test_xxx`

**Flutterwave:**
1. Go to https://flutterwave.com
2. Get your Secret Key
3. Add to `.env`: `FLUTTERWAVE_SECRET_KEY=xxx`

### 5. Email Setup

**SendGrid (Recommended):**
1. Go to https://sendgrid.com
2. Get API key
3. Add to `.env`: `SENDGRID_API_KEY=xxx`

**Or use SMTP:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
```

### 6. Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on: http://localhost:5000

## 📚 API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+234-800-123-4567"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

### Appointments

#### Create Appointment
```http
POST /api/appointments
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+234-800-123-4567",
  "service": "General Consultation",
  "date": "2025-12-01",
  "time": "10:00",
  "message": "Optional message"
}
```

#### Get All Appointments (User's own)
```http
GET /api/appointments
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Available Time Slots
```http
GET /api/appointments/available-slots/2025-12-01
```

#### Update Appointment
```http
PUT /api/appointments/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "date": "2025-12-02",
  "time": "14:00"
}
```

#### Cancel Appointment
```http
DELETE /api/appointments/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### Payments

#### Initialize Payment (Paystack)
```http
POST /api/payments/initialize/paystack
Content-Type: application/json

{
  "email": "john@example.com",
  "amount": 5000,
  "reference": "unique_ref_123",
  "metadata": {
    "appointmentId": "apt_123"
  }
}
```

#### Verify Payment
```http
GET /api/payments/verify/paystack/:reference
```

### Products (E-commerce)

#### Get All Products
```http
GET /api/products?category=Electronics&minPrice=1000&maxPrice=50000
```

#### Get Single Product
```http
GET /api/products/:id
```

#### Create Product (Admin only)
```http
POST /api/products
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 5000,
  "category": "Electronics",
  "stock": 100
}
```

### Orders (E-commerce)

#### Create Order
```http
POST /api/orders
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2,
      "price": 5000
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria"
  },
  "total": 10000
}
```

#### Get My Orders
```http
GET /api/orders/my-orders
Authorization: Bearer YOUR_JWT_TOKEN
```

### Admin Routes

#### Get Dashboard Statistics
```http
GET /api/admin/stats
Authorization: Bearer ADMIN_JWT_TOKEN
```

#### Get Recent Activities
```http
GET /api/admin/activities?limit=20
Authorization: Bearer ADMIN_JWT_TOKEN
```

#### Get Revenue Chart Data
```http
GET /api/admin/revenue-chart?period=week
Authorization: Bearer ADMIN_JWT_TOKEN
```

## 🔒 Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Password Hashing** - bcrypt with salt rounds
3. **Rate Limiting** - Prevent API abuse
4. **Helmet.js** - Security headers
5. **CORS** - Cross-origin resource sharing
6. **Input Validation** - Sanitize all inputs
7. **Webhook Verification** - Verify payment webhooks

## 🗄️ Database Schema

### Users Collection
```javascript
{
  id: string,
  name: string,
  email: string,
  password: string (hashed),
  phone: string,
  role: 'user' | 'admin',
  isActive: boolean,
  businessType: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Appointments Collection
```javascript
{
  id: string,
  fullName: string,
  email: string,
  phone: string,
  service: string,
  date: string,
  time: string,
  message: string,
  userId: string | null,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  paymentStatus: 'unpaid' | 'paid' | 'refunded',
  paymentReference: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Payments Collection
```javascript
{
  id: string,
  reference: string,
  email: string,
  amount: number,
  currency: string,
  provider: 'paystack' | 'flutterwave' | 'stripe',
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  paidAt: timestamp,
  gatewayResponse: object,
  metadata: object,
  createdAt: timestamp
}
```

## 🌐 Deployment

### Heroku
```bash
# Install Heroku CLI
heroku login
heroku create your-app-name
git push heroku main
heroku config:set NODE_ENV=production
```

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel
vercel
```

### Railway
```bash
# Connect to Railway
railway login
railway init
railway up
```

### Digital Ocean / AWS / Any VPS
```bash
# On your server
git clone your-repo
cd backend
npm install
npm start

# Use PM2 for production
npm install -g pm2
pm2 start server.js --name backend
pm2 save
```

## 🧪 Testing

### Test Email Service
```bash
curl -X POST http://localhost:5000/api/email/test \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com"}'
```

### Test Payment
Use Paystack test cards:
- **Success**: 5061 0200 0000 0000 227
- **Failure**: 5061 0200 0000 0000 219

## 🔧 Troubleshooting

**Database Connection Error:**
- Check Firebase/Supabase credentials
- Verify project ID and API keys

**Email Not Sending:**
- Verify SendGrid API key
- Check SMTP credentials
- Look for errors in console

**Payment Webhook Not Working:**
- Verify webhook URL is accessible
- Check webhook signature validation
- Use ngrok for local testing

**CORS Errors:**
- Add frontend URL to FRONTEND_URL in .env
- Check CORS middleware configuration

## 📝 Environment Variables Reference

```env
# Server
NODE_ENV=development | production
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database (Choose one)
FIREBASE_PROJECT_ID=
SUPABASE_URL=

# Authentication
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Payments
PAYSTACK_SECRET_KEY=
FLUTTERWAVE_SECRET_KEY=

# Email
SENDGRID_API_KEY=
FROM_EMAIL=
FROM_NAME=

# SMS (Optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

## 🤝 Support

For issues or questions:
1. Check this README
2. Review error messages in console
3. Test with Postman/Thunder Client
4. Check database connectivity

## 📄 License

MIT License - Free to use for personal and commercial projects

---

**Built with ❤️ | Production-Ready | Fully Scalable**
#   p a - h e a l t h c a r e  
 #   p a - h e a l t h c a r e  
 