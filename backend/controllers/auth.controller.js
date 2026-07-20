const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');
const securityService = require('../services/security.service');
const audit = require('../services/audit.service');

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const result = await authService.register(req.body);
    return res.status(201).json({ user: result });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { token, user } = await authService.login(req.body);
      // record successful login
      audit.record({ id: user.id, email: user.email }, 'login_success', 'user', user.id, { ip: req.ip });
    return res.status(200).json({ token, user });
  } catch (err) {
      // record failed attempt
      try {
        const ip = req.ip || req.connection.remoteAddress; 
        securityService.recordFailedAttempt(ip, req.body.email || null); 
        audit.record({ email: req.body.email || null }, 'login_failed', 'user', null, { ip, error: err.message || err }); 
      } catch (e) {}
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    await authService.forgotPassword(email);
    return res.json({ ok: true });
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password required' });
    await authService.resetPassword(token, password);
    return res.json({ ok: true });
  } catch (err) { next(err); }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });
    await authService.verifyEmail(token);
    return res.json({ ok: true });
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (token) {
      const decoded = require('jsonwebtoken').decode(token);
      const jti = decoded && decoded.jti;
      const exp = decoded && decoded.exp ? decoded.exp : null;
      if (jti) await authService.logout(jti, exp);
    }
    return res.json({ ok: true });
  } catch (err) { next(err); }
};

const me = async (req, res, next) => {
  try { return res.json({ user: req.user }); } catch (err) { next(err); }
};

module.exports = { register, login, forgotPassword, resetPassword, verifyEmail, logout, me };