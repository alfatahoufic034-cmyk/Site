const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../server');
const alertsService = require('../services/alerts.service');
const cleanupService = require('../services/cleanup.service');

const dataDir = path.join(__dirname, '..', 'data');
const securityAlertsFile = path.join(dataDir, 'security_alerts.json');

let superToken;

beforeAll(async () => {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  await request(app).post('/api/auth/register').send({ email: 'securitysuper@example.com', password: 'Password123!', name: 'Security Super' });
  const usersFile = path.join(dataDir, 'users.json');
  if (fs.existsSync(usersFile)) {
    const users = JSON.parse(fs.readFileSync(usersFile));
    const idx = users.findIndex(u => u.email === 'securitysuper@example.com');
    if (idx !== -1) {
      users[idx].role = 'super_admin';
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    }
  }
  const login = await request(app).post('/api/auth/login').send({ email: 'securitysuper@example.com', password: 'Password123!' });
  superToken = login.body.token;
});

beforeEach(() => {
  if (fs.existsSync(securityAlertsFile)) fs.unlinkSync(securityAlertsFile);
});

afterAll(() => {
  if (fs.existsSync(securityAlertsFile)) fs.unlinkSync(securityAlertsFile);
});

test('super_admin can read /api/admin/security-alerts and receives alert list', async () => {
  const alert = await alertsService.persistAlert('test_alert', { message: 'test payload' });
  expect(alert).toBeDefined();

  const res = await request(app).get('/api/admin/security-alerts').set('Authorization', `Bearer ${superToken}`);
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body.alerts)).toBe(true);
  expect(res.body.alerts.some(a => a.type === 'test_alert')).toBe(true);
});

test('security summary returns counts and latest alert details', async () => {
  await alertsService.persistAlert('summary_alert', { created_by: 'test' });
  const res = await request(app).get('/api/admin/security').set('Authorization', `Bearer ${superToken}`);
  expect(res.statusCode).toBe(200);
  expect(res.body.overview).toBeDefined();
  expect(res.body.overview.total).toBeGreaterThanOrEqual(1);
  expect(res.body.overview.latest).toBeDefined();
  expect(res.body.recent_alerts).toBeDefined();
});

test('cleanup removes expired security alerts according to retention policy', async () => {
  const oldAlert = { id: Date.now() - 1000, type: 'expired', payload: { data: 'old' }, created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString() };
  const newAlert = { id: Date.now(), type: 'fresh', payload: { data: 'new' }, created_at: new Date().toISOString() };
  fs.writeFileSync(securityAlertsFile, JSON.stringify([oldAlert, newAlert], null, 2));

  process.env.RETENTION_SECURITY_ALERTS_DAYS = '90';
  await cleanupService.runCleanup();
  const items = JSON.parse(fs.readFileSync(securityAlertsFile));
  expect(items.some(a => a.type === 'fresh')).toBe(true);
  expect(items.some(a => a.type === 'expired')).toBe(false);
});
