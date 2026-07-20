const fs = require('fs');
const path = require('path');
const supabase = require('../database/supabaseClient');

const filePath = path.join(__dirname, '..', 'data', 'tokens.json');
const ensure = () => { const dir = path.dirname(filePath); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]'); };

const create = async (t) => {
  if (supabase) { const { data, error } = await supabase.from('tokens').insert([t]).select().single(); if (error) throw error; return data; }
  ensure(); const items = JSON.parse(fs.readFileSync(filePath)); items.push(t); fs.writeFileSync(filePath, JSON.stringify(items, null,2)); return t;
};

const findByToken = async (token) => {
  if (supabase) { const { data, error } = await supabase.from('tokens').select('*').eq('token', token).limit(1).single(); if (error) return null; return data; }
  ensure(); const items = JSON.parse(fs.readFileSync(filePath)); return items.find(i => i.token === token) || null;
};

const consume = async (token) => {
  if (supabase) { const { data, error } = await supabase.from('tokens').update({ used: true }).eq('token', token).select().single(); if (error) throw error; return data; }
  ensure(); const items = JSON.parse(fs.readFileSync(filePath)); const idx = items.findIndex(i => i.token === token); if (idx === -1) return null; items[idx].used = true; fs.writeFileSync(filePath, JSON.stringify(items, null,2)); return items[idx];
};

const blacklistJwt = async (jti, expiresAt) => {
  return create({ token: jti, type: 'blacklist', expires_at: expiresAt });
};

const isBlacklisted = async (jti) => {
  if (!jti) return false;
  if (supabase) { const { data } = await supabase.from('tokens').select('*').eq('token', jti).eq('type','blacklist').limit(1).single(); return !!data; }
  ensure(); const items = JSON.parse(fs.readFileSync(filePath)); return items.some(i => i.type === 'blacklist' && i.token === jti && (!i.expires_at || new Date(i.expires_at) > new Date()));
};

module.exports = { create, findByToken, consume, blacklistJwt, isBlacklisted };
