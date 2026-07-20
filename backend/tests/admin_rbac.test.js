const request = require('supertest');
const app = require('../server');

let adminToken, userToken;

beforeAll(async () => {
  // ensure admin
  await request(app).post('/api/auth/register').send({ email: 'rbacadmin@example.com', password: 'Password123!', name: 'RBAC Admin' });
  try {
    const p = require('path').join(__dirname, '..', 'data', 'users.json');
    if (require('fs').existsSync(p)) {
      const users = JSON.parse(require('fs').readFileSync(p));
      const idx = users.findIndex(u => u.email === 'rbacadmin@example.com');
      if (idx !== -1) { users[idx].role = 'admin'; require('fs').writeFileSync(p, JSON.stringify(users, null,2)); }
    }
  } catch (e) {}
  const res = await request(app).post('/api/auth/login').send({ email: 'rbacadmin@example.com', password: 'Password123!' });
  adminToken = res.body.token;

  // normal user
  await request(app).post('/api/auth/register').send({ email: 'rbacuser@example.com', password: 'Password123!', name: 'RBAC User' });
  const res2 = await request(app).post('/api/auth/login').send({ email: 'rbacuser@example.com', password: 'Password123!' });
  userToken = res2.body.token;
});

test('normal user cannot access admin dashboard', async () => {
  const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${userToken}`);
  expect(res.statusCode).toBe(403);
});

test('admin can access admin dashboard', async () => {
  const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${adminToken}`);
  expect(res.statusCode).toBe(200);
});

test('normal user cannot delete user', async () => {
  const res = await request(app).delete('/api/admin/users/rbacuser@example.com').set('Authorization', `Bearer ${userToken}`);
  expect(res.statusCode).toBe(403);
});

test('admin can delete user', async () => {
  const res = await request(app).delete('/api/admin/users/rbacuser@example.com').set('Authorization', `Bearer ${adminToken}`);
  expect([200,404]).toContain(res.statusCode);
});
