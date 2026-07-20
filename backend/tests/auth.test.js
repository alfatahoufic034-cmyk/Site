const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../server');

const dataDir = path.join(__dirname, '..', 'data');
const usersFile = path.join(dataDir, 'users.json');
const tokensFile = path.join(dataDir, 'tokens.json');

beforeAll(() => {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  if (fs.existsSync(usersFile)) fs.unlinkSync(usersFile);
  if (fs.existsSync(tokensFile)) fs.unlinkSync(tokensFile);
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
  process.env.JWT_EXPIRES_IN = '1h';
});

describe('Auth flow', () => {
  const email = 'testuser@example.com';
  const password = 'Password123!';

  test('register user', async () => {
    const res = await request(app).post('/api/auth/register').send({ email, password, name: 'Test' });
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(email);
  });

  test('login user', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('forgot password generates token', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    const tokens = JSON.parse(fs.readFileSync(tokensFile));
    const reset = tokens.find(t => t.type === 'reset');
    expect(reset).toBeDefined();
  });

  test('reset password with token works', async () => {
    const tokens = JSON.parse(fs.readFileSync(tokensFile));
    const reset = tokens.find(t => t.type === 'reset');
    expect(reset).toBeDefined();
    const newPass = 'NewPass123!';
    const res = await request(app).post('/api/auth/reset-password').send({ token: reset.token, password: newPass });
    expect(res.statusCode).toBe(200);
    // login with new password
    const login = await request(app).post('/api/auth/login').send({ email, password: newPass });
    expect(login.statusCode).toBe(200);
    expect(login.body.token).toBeDefined();
  });

});
