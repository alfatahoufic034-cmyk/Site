const { v4: uuidv4 } = require('uuid');
const tokenModel = require('../models/token.model');

const generate = async (type, user_id, ttlSeconds = 3600) => {
  const token = uuidv4();
  const obj = { token, type, user_id, used: false, expires_at: Date.now() + ttlSeconds * 1000 };
  return tokenModel.create(obj);
};

const validateAndConsume = async (token, type) => {
  const rec = await tokenModel.findByToken(token);
  if (!rec) throw { status: 400, message: 'Invalid token' };
  if (type && rec.type !== type) throw { status: 400, message: 'Invalid token type' };
  if (rec.used) throw { status: 400, message: 'Token already used' };
  if (rec.expires_at && rec.expires_at < Date.now()) throw { status: 400, message: 'Token expired' };
  await tokenModel.consume(token);
  return rec;
};

const blacklist = async (tokenOrJti, expiresAt) => {
  return tokenModel.blacklistJwt(tokenOrJti, expiresAt || Date.now() + 1000 * 60 * 60);
};

module.exports = { generate, validateAndConsume, blacklist };
const crypto = require('crypto');
const tokenModel = require('../models/token.model');

const generate = async (type, userId, ttlSeconds = 3600) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expires_at = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  const entry = { token, type, user_id: userId, expires_at, used: false };
  await tokenModel.create(entry);
  return entry;
};

const validateAndConsume = async (token, type) => {
  const t = await tokenModel.findByToken(token);
  if (!t) throw { status: 400, message: 'Invalid token' };
  if (t.type !== type) throw { status: 400, message: 'Invalid token type' };
  if (t.used) throw { status: 400, message: 'Token already used' };
  if (t.expires_at && new Date(t.expires_at) < new Date()) throw { status: 400, message: 'Token expired' };
  await tokenModel.consume(token);
  return t;
};

const blacklist = async (token, expiresAt) => {
  const entry = { token, type: 'blacklist', user_id: null, expires_at: expiresAt || null, used: false };
  await tokenModel.create(entry);
  return entry;
};

module.exports = { generate, validateAndConsume, blacklist };
