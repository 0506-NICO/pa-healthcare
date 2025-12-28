# 🔧 BACKEND API - COMPLETE REFERENCE

## 🚀 Quick Start

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

Server runs on: `http://localhost:5002`

---

## 📋 API ENDPOINTS - ALL 46+

### **Authentication** (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Create new account | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/logout` | Logout user | No |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |
| PUT | `/auth/update-password` | Change password | Yes |

### **Users** (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | Get all users (admin) | Admin |
| GET | `/users/:id` | Get user by ID | Yes |
| GET | `/users/profile` | Get own profile | Yes |
| PUT | `/users/:id` | Update user | Yes |
| DELETE | `/users/:id` | Delete user | Admin |
| PUT | `/users/profile` | Update own profile | Yes |

### **Appointments** (`/api/appointments`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/appointments` | Create appointment | No |
| GET | `/appointments` | Get all appointments | Yes |
| GET | `/appointments/:id` | Get appointment by ID | Yes |
| PUT | `/appointments/:id` | Update appointment | Yes |
| DELETE | `/appointments/:id` | Cancel appointment | Yes |
| PUT | `/appointments/:id/confirm` | Confirm appointment | Admin |
| GET | `/appointments/user/:userId` | Get user appointments | Yes |
| GET | `/appointments/available-slots` | Get available time slots | No |

### **Payments** (`/api/payments`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/payments/initialize/paystack` | Initialize Paystack payment | No |
| POST | `/payments/initialize/flutterwave` | Initialize Flutterwave payment | No |
| GET | `/payments/verify/paystack/:reference` | Verify Paystack payment | No |
| GET | `/payments/verify/flutterwave/:txRef` | Verify Flutterwave payment | No |
| POST | `/payments/webhook/paystack` | Paystack webhook | No |
| POST | `/payments/webhook/flutterwave` | Flutterwave webhook | No |
| GET | `/payments` | Get all payments | Admin |
| GET | `/payments/user/:userId` | Get user payments | Yes |
| POST | `/payments/refund/:id` | Refund payment | Admin |

### **Products** (`/api/products`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/products` | Get all products | No |
| GET | `/products/:id` | Get product by ID | No |
| POST | `/products` | Create product | Admin |
| PUT | `/products/:id` | Update product | Admin |
| DELETE | `/products/:id` | Delete product | Admin |
| GET | `/products/category/:category` | Get by category | No |
| GET | `/products/search` | Search products | No |

### **Orders** (`/api/orders`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/orders` | Create order | Yes |
| GET | `/orders` | Get all orders | Admin |
| GET | `/orders/:id` | Get order by ID | Yes |
| GET | `/orders/user/:userId` | Get user orders | Yes |
| PUT | `/orders/:id/status` | Update order status | Admin |
| DELETE | `/orders/:id` | Cancel order | Yes |

### **Admin** (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/stats` | Get dashboard statistics | Admin |
| GET | `/admin/revenue` | Get revenue data | Admin |
| GET | `/admin/users` | Get all users | Admin |
| GET | `/admin/appointments` | Get all appointments | Admin |
| GET | `/admin/payments` | Get all payments | Admin |
| GET | `/admin/logs` | Get system logs | Admin |

### **Email** (`/api/email`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/email/send` | Send email | Yes |
| POST | `/email/contact` | Contact form | No |
| POST | `/email/newsletter` | Subscribe to newsletter | No |

### **Health Check**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | Server health check | No |
| GET | `/api/csrf-token` | Get CSRF token | No |

---

## 🔐 Authentication

All protected endpoints require JWT token:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

---

## 📝 Example Requests

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+234-800-123-4567",
  "password": "SecurePass123!",
  "businessType": "healthcare"
}
```

### Create Appointment
```bash
POST /api/appointments
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+234-800-123-4567",
  "service": "General Consultation",
  "date": "2025-12-01",
  "time": "10:00 AM",
  "message": "First time visit"
}
```

### Initialize Payment
```bash
POST /api/payments/initialize/paystack
Content-Type: application/json

{
  "email": "john@example.com",
  "amount": 5000,
  "reference": "apt_123_1234567890",
  "metadata": {
    "appointmentId": "123",
    "service": "General Consultation"
  }
}
```

---

## 🛡️ Security Features

- ✅ Helmet (Security Headers)
- ✅ CORS (Strict Origin Control)
- ✅ Rate Limiting (100 req/15min)
- ✅ CSRF Protection
- ✅ XSS Prevention
- ✅ NoSQL Injection Prevention
- ✅ Input Validation
- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Account Lockout

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

---

## 🔧 Environment Variables

See `.env.example` for all required variables.

Critical variables:
- `JWT_SECRET`
- `DATABASE` credentials
- `PAYSTACK_SECRET_KEY`
- `SENDGRID_API_KEY`

---

## 📝 Total Endpoints: 46+

**Authentication:** 7 endpoints  
**Users:** 6 endpoints  
**Appointments:** 8 endpoints  
**Payments:** 9 endpoints  
**Products:** 7 endpoints  
**Orders:** 6 endpoints  
**Admin:** 6 endpoints  
**Email:** 3 endpoints  
**Utility:** 2 endpoints  

---

**Ready for production! 🚀**
