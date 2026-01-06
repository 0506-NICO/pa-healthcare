# P&A Healthcare System

## Overview
A full-stack healthcare platform with appointment booking, payment processing, and admin dashboard capabilities.

## Project Architecture

### Frontend (Port 5000)
- **Technology**: Static HTML/CSS/JavaScript
- **Dev Server**: live-server
- **Entry Point**: `frontend/index.html`
- **Key Files**:
  - `frontend/js/healthcare-app.js` - Main application logic
  - `frontend/config/config.js` - Business configuration
  - `frontend/css/` - Stylesheets

### Backend (Port 3000)
- **Technology**: Node.js + Express
- **Entry Point**: `backend/server.js`
- **Database**: Supabase (PostgreSQL) - optional, works without it
- **Key Routes**:
  - `/api/auth/*` - Authentication
  - `/api/appointments/*` - Appointment management
  - `/api/users/profile` - User profile
  - `/api/admin/*` - Admin dashboard
  - `/api/payments/*` - Payment processing

## Running the Application
- Frontend: `cd frontend && npm run dev` (Port 5000)
- Backend: `cd backend && node server.js` (Port 3000)

## Environment Variables (Optional)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_KEY` / `SUPABASE_ANON_KEY` - Supabase keys
- `JWT_SECRET` - Secret for JWT tokens
- `SENDGRID_API_KEY` - For email functionality
- `TWILIO_*` - For SMS functionality

## Features
- User authentication (register/login)
- Appointment booking
- Payment integration (Paystack)
- Admin dashboard
- Email/SMS notifications (when configured)
