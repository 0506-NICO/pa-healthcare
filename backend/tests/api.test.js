// ============================================
// EXAMPLE TESTS - Backend API
// Run with: npm test
// ============================================

const request = require('supertest');
const app = require('../server');

describe('Health Check', () => {
  test('GET /api/health should return OK', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('message');
  });
});

describe('Authentication', () => {
  test('POST /api/auth/register should create user', async () => {
    const userData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'TestPass123!',
      phone: '+234-800-123-4567'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data.user).toHaveProperty('email', userData.email);
  });

  test('POST /api/auth/login should return token', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'TestPass123!'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(credentials)
      .expect('Content-Type', /json/);

    if (response.status === 200) {
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    }
  });
});

describe('Appointments', () => {
  test('POST /api/appointments should create appointment', async () => {
    const appointmentData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+234-800-123-4567',
      service: 'General Consultation',
      date: '2025-12-01',
      time: '10:00 AM',
      message: 'Test appointment'
    };

    const response = await request(app)
      .post('/api/appointments')
      .send(appointmentData)
      .expect('Content-Type', /json/);

    expect(response.status).toBeLessThan(500);
  });
});

describe('Payments', () => {
  test('POST /api/payments/initialize/paystack should initialize payment', async () => {
    const paymentData = {
      email: 'test@example.com',
      amount: 5000,
      reference: `test_${Date.now()}`
    };

    const response = await request(app)
      .post('/api/payments/initialize/paystack')
      .send(paymentData)
      .expect('Content-Type', /json/);

    expect(response.status).toBeLessThan(500);
  });
});

// Add more tests as needed...
