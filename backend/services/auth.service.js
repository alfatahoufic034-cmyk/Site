const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const userModel = require('../models/user.model');
const tokenModel = require('../models/token.model');
const emailService = require('./email.service');

const register = async ({ email, password, name }) => {
  const existing = await userModel.findByEmail(email);
  if (existing) throw { status: 400, message: 'Email already registered' };

  const hash = await bcrypt.hash(password, 12);
  const user = {
    email,
    password: hash,
    name: name || '',
    role: 'client',
    verified: false,
    created_at: new Date().toISOString()
  };
  const created = await userModel.create(user);

  // create email verification token
  const token = uuidv4();
  await tokenModel.create({ token, user_id: created.id || created.email, type: 'verify', expires_at: Date.now() + 1000 * 60 * 60 * 24 });
  // send email (best effort)
  await emailService.sendMail({ to: created.email, subject: 'Verify your account', text: `Use this token to verify: ${token}` });

  return { id: created.id || null, email: created.email, name: created.name, role: created.role };
};

const login = async ({ email, password }) => {
  const user = await userModel.findByEmail(email);
  if (!user) throw { status: 400, message: 'Invalid credentials' };
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw { status: 400, message: 'Invalid credentials' };

  const jti = uuidv4();
  const payload = { id: user.id || user.email, email: user.email, role: user.role || 'client' };
  const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn, jwtid: jti });

  return { token, user: payload, jti };
};

const logout = async (jti, exp) => {
  // store jti in blacklist until expiry
  const expiresAt = exp ? exp * 1000 : Date.now() + 1000 * 60 * 60;
  return tokenModel.blacklistJwt(jti, expiresAt);
};

const forgotPassword = async (email) => {
  const user = await userModel.findByEmail(email);
  if (!user) return null;
  const token = uuidv4();
  await tokenModel.create({ token, user_id: user.id || user.email, type: 'reset', expires_at: Date.now() + 1000 * 60 * 60 });
  await emailService.sendMail({ to: user.email, subject: 'Reset your password', text: `Use this token to reset your password: ${token}` });
  return true;
};

const resetPassword = async (token, newPassword) => {
  const rec = await tokenModel.findByToken(token);
  if (!rec || rec.type !== 'reset' || rec.expires_at < Date.now()) throw { status: 400, message: 'Invalid or expired token' };
  const user = await userModel.findByEmail(rec.user_id);
  if (!user) throw { status: 404, message: 'User not found' };
  const hash = await bcrypt.hash(newPassword, 12);
  await userModel.update(rec.user_id, { password: hash });
  // consume token
  if (tokenModel.consume) await tokenModel.consume(token);
  return true;
};

const verifyEmail = async (token) => {
  const rec = await tokenModel.findByToken(token);
  if (!rec || rec.type !== 'verify' || rec.expires_at < Date.now()) throw { status: 400, message: 'Invalid or expired token' };
  // mark user verified
  const userId = rec.user_id;
  if (require('../database/supabaseClient')) {
    const supabase = require('../database/supabaseClient');
    await supabase.from('users').update({ verified: true }).eq('id', userId);
  } else {
    const fs = require('fs'); const path = require('path'); const file = path.join(__dirname, '..', 'data', 'users.json'); const users = JSON.parse(fs.readFileSync(file)); const idx = users.findIndex(u => (u.id && u.id==userId) || u.email===userId); if (idx>=0) { users[idx].verified = true; fs.writeFileSync(file, JSON.stringify(users,null,2)); }
  }
  return true;
};

module.exports = { register, login, logout, forgotPassword, resetPassword, verifyEmail };