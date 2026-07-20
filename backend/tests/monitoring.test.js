const request = require('supertest');
const app = require('../server');

let adminToken, superToken;

beforeAll(async () => {
  await request(app).post('/api/auth/register').send({ email: 'monadmin@example.com', password: 'Password123!', name: 'Mon Admin' });
  await request(app).post('/api/auth/register').send({ email: 'monsuper@example.com', password: 'Password123!', name: 'Mon Super' });
  // promote roles in file-store
  const p = require('path').join(__dirname, '..', 'data', 'users.json');
  if (require('fs').existsSync(p)) {
    const users = JSON.parse(require('fs').readFileSync(p));
    const idxA = users.findIndex(u => u.email === 'monadmin@example.com'); if (idxA!==-1) users[idxA].role='admin';
    const idxS = users.findIndex(u => u.email === 'monsuper@example.com'); if (idxS!==-1) users[idxS].role='super_admin';
    require('fs').writeFileSync(p, JSON.stringify(users, null,2));
  }
  const r1 = await request(app).post('/api/auth/login').send({ email: 'monadmin@example.com', password: 'Password123!' });
  adminToken = r1.body.token;
  const r2 = await request(app).post('/api/auth/login').send({ email: 'monsuper@example.com', password: 'Password123!' });
  superToken = r2.body.token;
});

test('admin can access analytics and errors but not security summary', async () => {
  const a = await request(app).get('/api/admin/analytics').set('Authorization', `Bearer ${adminToken}`);
  expect(a.statusCode).toBe(200);
  const e = await request(app).get('/api/admin/errors').set('Authorization', `Bearer ${adminToken}`);
  expect(e.statusCode).toBe(200);
  const s = await request(app).get('/api/admin/security').set('Authorization', `Bearer ${adminToken}`);
  expect(s.statusCode).toBe(403);
});

test('super_admin can access security and audit logs', async () => {
  const s = await request(app).get('/api/admin/security').set('Authorization', `Bearer ${superToken}`);
  expect([200,204]).toContain(s.statusCode);
  const a = await request(app).get('/api/admin/audit-logs').set('Authorization', `Bearer ${superToken}`);
  expect([200,204]).toContain(a.statusCode);
});

test('super_admin can access security alerts endpoint', async () => {
  const res = await request(app).get('/api/admin/security-alerts').set('Authorization', `Bearer ${superToken}`);
  expect([200,204]).toContain(res.statusCode);
});
