# 🗄️ COMPLETE DATABASE SETUP GUIDE

## 📋 DATABASE OPTIONS & SETUP

You can use **Firebase** OR **Supabase** - both are configured and ready!

---

## 🔥 OPTION 1: FIREBASE (RECOMMENDED FOR BEGINNERS)

### **Step 1: Create Firebase Project**

1. Go to https://console.firebase.google.com
2. Click "Add Project"
3. Enter project name: `healthcare-app`
4. Enable Google Analytics (optional)
5. Click "Create Project"

### **Step 2: Enable Firestore Database**

1. In Firebase Console, click "Firestore Database"
2. Click "Create Database"
3. Choose "Start in production mode"
4. Select location (closest to your users)
5. Click "Enable"

### **Step 3: Get Firebase Credentials**

1. Go to Project Settings (⚙️ icon)
2. Go to "Service Accounts" tab
3. Click "Generate New Private Key"
4. Save the JSON file securely

### **Step 4: Add to Backend .env**

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"
```

### **Step 5: Set Firebase Security Rules**

In Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // USERS Collection
    match /users/{userId} {
      // Anyone can create a user (for registration)
      allow create: if true;
      
      // Users can read and update their own profile
      allow read, update: if isOwner(userId);
      
      // Only admins can delete users
      allow delete: if isAdmin();
      
      // Admins can read all users
      allow read: if isAdmin();
    }
    
    // APPOINTMENTS Collection
    match /appointments/{appointmentId} {
      // Anyone can create an appointment
      allow create: if true;
      
      // Users can read their own appointments
      allow read: if isAuthenticated() && 
                     (resource.data.userId == request.auth.uid || 
                      resource.data.email == request.auth.token.email ||
                      isAdmin());
      
      // Users can update/cancel their own appointments
      allow update, delete: if isAuthenticated() && 
                               (resource.data.userId == request.auth.uid || 
                                isAdmin());
      
      // Admins can read all appointments
      allow list: if isAdmin();
    }
    
    // PAYMENTS Collection
    match /payments/{paymentId} {
      // Only backend can create payments (via Admin SDK)
      allow create: if false;
      
      // Users can read their own payments
      allow read: if isAuthenticated() && 
                     (resource.data.email == request.auth.token.email ||
                      isAdmin());
      
      // Only admins can update/delete payments
      allow update, delete: if isAdmin();
    }
    
    // PRODUCTS Collection (E-commerce)
    match /products/{productId} {
      // Everyone can read products
      allow read: if true;
      
      // Only admins can create, update, delete products
      allow create, update, delete: if isAdmin();
    }
    
    // ORDERS Collection (E-commerce)
    match /orders/{orderId} {
      // Authenticated users can create orders
      allow create: if isAuthenticated();
      
      // Users can read their own orders
      allow read: if isAuthenticated() && 
                     (resource.data.userId == request.auth.uid || 
                      isAdmin());
      
      // Admins can update order status
      allow update: if isAdmin();
      
      // No one can delete orders
      allow delete: if false;
    }
    
    // Deny all other collections by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### **Step 6: Set Storage Rules** (if using file uploads)

Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{userId}/{allPaths=**} {
      // Users can read their own files
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Users can write to their own directory
      allow write: if request.auth != null && 
                      request.auth.uid == userId &&
                      request.resource.size < 5 * 1024 * 1024; // 5MB limit
    }
    
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

---

## 🟢 OPTION 2: SUPABASE (RECOMMENDED FOR SQL)

### **Step 1: Create Supabase Project**

1. Go to https://supabase.com
2. Click "New Project"
3. Enter details:
   - Name: `healthcare-app`
   - Database Password: (save this!)
   - Region: Closest to you
4. Click "Create Project"

### **Step 2: Get Supabase Credentials**

1. Go to Project Settings → API
2. Copy:
   - Project URL
   - Anon/Public Key
   - Service Role Key (secret!)

### **Step 3: Add to Backend .env**

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
```

### **Step 4: Create Database Tables**

In Supabase Dashboard → SQL Editor, run:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user',
  business_type TEXT,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  two_factor_enabled BOOLEAN DEFAULT false,
  login_attempts INTEGER DEFAULT 0,
  lockout_until TIMESTAMP,
  last_login TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  reset_token TEXT,
  reset_token_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- APPOINTMENTS Table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  message TEXT,
  user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  payment_reference TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMP,
  cancelled_by UUID,
  confirmed_at TIMESTAMP,
  confirmed_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- PAYMENTS Table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  provider TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMP,
  gateway_response JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- PRODUCTS Table (E-commerce)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  stock INTEGER DEFAULT 0,
  images JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ORDERS Table (E-commerce)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  items JSONB NOT NULL,
  shipping_address JSONB,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_payments_reference ON payments(reference);
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Step 5: Enable Row Level Security (RLS)**

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- USERS Policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- APPOINTMENTS Policies
CREATE POLICY "Anyone can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  USING (
    auth.uid() = user_id OR 
    email = auth.jwt() ->> 'email' OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    auth.jwt() ->> 'role' = 'admin'
  );

-- PAYMENTS Policies
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (
    email = auth.jwt() ->> 'email' OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- PRODUCTS Policies (Public read)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ORDERS Policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');
```

---

## 🔄 DATABASE MIGRATION GUIDE

### **From Firebase to Supabase:**

```javascript
// Export from Firebase
const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');

async function migrateData() {
  const firestore = admin.firestore();
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  // Migrate users
  const usersSnapshot = await firestore.collection('users').get();
  for (const doc of usersSnapshot.docs) {
    await supabase.from('users').insert(doc.data());
  }
  
  // Migrate appointments
  const appointmentsSnapshot = await firestore.collection('appointments').get();
  for (const doc of appointmentsSnapshot.docs) {
    await supabase.from('appointments').insert(doc.data());
  }
}
```

---

## 🔐 SECURITY BEST PRACTICES

### **Both Firebase & Supabase:**

1. **Never expose service keys in frontend**
2. **Always use Row Level Security (RLS)**
3. **Validate data on backend**
4. **Use prepared statements/SDKs**
5. **Enable audit logging**
6. **Regular backups**
7. **Monitor for suspicious activity**

### **Backup Strategy:**

```bash
# Firebase backup (automated)
gcloud firestore export gs://your-bucket

# Supabase backup
pg_dump -h db.your-project.supabase.co -U postgres > backup.sql
```

---

## 📊 DATABASE COMPARISON

```
FIREBASE:
✅ Easy setup
✅ Real-time updates
✅ Great for beginners
✅ Auto-scaling
❌ Limited queries
❌ More expensive at scale

SUPABASE:
✅ Full SQL power
✅ Complex queries
✅ Open source
✅ Cheaper at scale
❌ Steeper learning curve
❌ Manual scaling
```

---

## ✅ SETUP CHECKLIST

- [ ] Choose database (Firebase or Supabase)
- [ ] Create project
- [ ] Get credentials
- [ ] Add to .env file
- [ ] Set security rules
- [ ] Create tables/collections
- [ ] Test connection
- [ ] Enable backups
- [ ] Monitor usage

---

**Database is now production-ready! 🎉**
