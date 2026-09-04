'use strict';

const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../server');

const VALID_PASSWORD = 'Str0ng#Pass2026!';
const WEAK_PASSWORD  = 'tooshort';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('POST /api/v1/auth/register', () => {
  it('rejects missing fields', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects a weak password', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test', email: 'weak@test.com', password: WEAK_PASSWORD
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('creates a new user and sets httpOnly cookies', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Alice', email: 'alice@test.com', password: VALID_PASSWORD
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('alice@test.com');
    expect(res.body.user.password).toBeUndefined();

    const cookies = res.headers['set-cookie'] || [];
    expect(cookies.some((c) => c.startsWith('access_token='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('refresh_token='))).toBe(true);
    expect(cookies.some((c) => c.includes('HttpOnly'))).toBe(true);
  });

  it('rejects duplicate email', async () => {
    await request(app).post('/api/v1/auth/register').send({
      name: 'Bob', email: 'dup@test.com', password: VALID_PASSWORD
    });
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Bob2', email: 'dup@test.com', password: VALID_PASSWORD
    });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeAll(async () => {
    await request(app).post('/api/v1/auth/register').send({
      name: 'Login User', email: 'login@test.com', password: VALID_PASSWORD
    });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'login@test.com', password: VALID_PASSWORD
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('login@test.com');
  });

  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'login@test.com', password: 'WrongPass!99'
    });
    expect(res.status).toBe(401);
  });

  it('rejects unknown email', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'nobody@test.com', password: VALID_PASSWORD
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/auth/profile', () => {
  let cookies = '';

  beforeAll(async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Profile User', email: 'profile@test.com', password: VALID_PASSWORD
    });
    cookies = (res.headers['set-cookie'] || []).join('; ');
  });

  it('returns profile when authenticated', async () => {
    const res = await request(app).get('/api/v1/auth/profile').set('Cookie', cookies);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('profile@test.com');
  });

  it('returns 401 without cookie', async () => {
    const res = await request(app).get('/api/v1/auth/profile');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/logout', () => {
  let cookies = '';

  beforeAll(async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Logout User', email: 'logout@test.com', password: VALID_PASSWORD
    });
    cookies = (res.headers['set-cookie'] || []).join('; ');
  });

  it('logs out and revokes token', async () => {
    const logoutRes = await request(app).post('/api/v1/auth/logout').set('Cookie', cookies);
    expect(logoutRes.status).toBe(200);

    // Token should now be blacklisted
    const profileRes = await request(app).get('/api/v1/auth/profile').set('Cookie', cookies);
    expect(profileRes.status).toBe(401);
  });
});
