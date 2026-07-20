const security = require('../services/security.service');
const fs = require('fs');
const path = require('path');

const attemptsFile = path.join(__dirname, '..', 'data', 'login_attempts.json');
const blockedFile = path.join(__dirname, '..', 'data', 'blocked_ips.json');

beforeEach(() => {
  if (fs.existsSync(attemptsFile)) fs.unlinkSync(attemptsFile);
  if (fs.existsSync(blockedFile)) fs.unlinkSync(blockedFile);
});

test('record failed attempts and block ip', () => {
  const ip = '1.2.3.4';
  expect(security.isBlocked(ip)).toBe(false);
  for (let i=0;i<10;i++) security.recordFailedAttempt(ip, 'test@example.com');
  // after threshold, ip should be blocked
  expect(security.isBlocked(ip)).toBe(true);
  // unblock and check
  security.unblockIp(ip);
  expect(security.isBlocked(ip)).toBe(false);
});
