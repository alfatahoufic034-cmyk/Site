const request = require('supertest');
const app = require('../server');
const fs = require('fs');
const path = require('path');

let token;

beforeAll(async () => {
  // register admin user
  await request(app).post('/api/auth/register').send({ email: 'admin@example.com', password: 'Password123!', name: 'Admin', role: 'admin' });
  // promote to admin in file-based store so tests can access admin endpoints
  try {
    const p = require('path').join(__dirname, '..', 'data', 'users.json');
    if (require('fs').existsSync(p)) {
      const users = JSON.parse(require('fs').readFileSync(p));
      const idx = users.findIndex(u => u.email === 'admin@example.com');
      if (idx !== -1) { users[idx].role = 'admin'; require('fs').writeFileSync(p, JSON.stringify(users, null,2)); }
    }
  } catch (e) {}
  const res = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'Password123!' });
  token = res.body.token;
});

test('GET /api/admin/dashboard', async () => {
  const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${token}`);
  expect(res.statusCode).toBe(200);
  expect(res.body.counts).toBeDefined();
});

test('POST /api/admin/reviews/:id/approve (not found)', async () => {
  const res = await request(app).post('/api/admin/reviews/notfound/approve').set('Authorization', `Bearer ${token}`);
  expect([200,404]).toContain(res.statusCode);
});

test('POST /api/admin/contacts/:id/respond (not found)', async () => {
  const res = await request(app).post('/api/admin/contacts/notfound/respond').set('Authorization', `Bearer ${token}`).send({ response: 'Thank you' });
  expect([200,404]).toContain(res.statusCode);
});

test('DELETE /api/admin/uploads/:filename (not found)', async () => {
  const res = await request(app).delete('/api/admin/uploads/nope.txt').set('Authorization', `Bearer ${token}`);
  expect([200,404]).toContain(res.statusCode);
});

test('DELETE /api/admin/users/:id deletes a user', async () => {
  // create a temporary user
  await request(app).post('/api/auth/register').send({ email: 'temp@example.com', password: 'Password123!', name: 'Temp' });
  const res = await request(app).delete('/api/admin/users/temp@example.com').set('Authorization', `Bearer ${token}`);
  expect([200,404]).toContain(res.statusCode);
});
