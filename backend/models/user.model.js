const fs = require('fs');
const path = require('path');
const supabase = require('../database/supabaseClient');

const usersFile = path.join(__dirname, '..', 'data', 'users.json');

const ensureLocalStore = () => {
  const dir = path.dirname(usersFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, JSON.stringify([]));
};

const findByEmail = async (email) => {
  if (supabase) {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).limit(1).single();
    if (error) return null;
    return data;
  }
  ensureLocalStore();
  const users = JSON.parse(fs.readFileSync(usersFile));
  return users.find(u => u.email === email) || null;
};

const create = async (user) => {
  if (supabase) {
    const { data, error } = await supabase.from('users').insert([user]).select().single();
    if (error) throw error;
    return data;
  }
  ensureLocalStore();
  const users = JSON.parse(fs.readFileSync(usersFile));
  users.push(user);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  return user;
};

const update = async (identifier, changes) => {
  if (supabase) {
    const key = typeof identifier === 'string' && identifier.includes('@') ? 'email' : 'id';
    const { data, error } = await supabase.from('users').update(changes).eq(key, identifier).select().single();
    if (error) throw error;
    return data;
  }
  ensureLocalStore();
  const users = JSON.parse(fs.readFileSync(usersFile));
  const idx = users.findIndex(u => (u.id && u.id === identifier) || u.email === identifier);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...changes };
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  return users[idx];
};

const remove = async (identifier) => {
  if (supabase) {
    const key = typeof identifier === 'string' && identifier.includes('@') ? 'email' : 'id';
    const { data, error } = await supabase.from('users').update({ deleted_at: new Date().toISOString() }).eq(key, identifier).select().single();
    if (error) throw error; return data;
  }
  ensureLocalStore();
  const users = JSON.parse(fs.readFileSync(usersFile));
  const idx = users.findIndex(u => (u.id && u.id === identifier) || u.email === identifier);
  if (idx === -1) return null;
  users[idx].deleted_at = new Date().toISOString();
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  return users[idx];
};

module.exports = { findByEmail, create, update, delete: remove };

