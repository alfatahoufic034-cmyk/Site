const fs = require('fs');
const path = require('path');
const supabase = require('../database/supabaseClient');

const filePath = path.join(__dirname, '..', 'data', 'requests.json');
const ensure = () => { const dir = path.dirname(filePath); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]'); };

const create = async (req) => {
  if (supabase) {
    const { data, error } = await supabase.from('requests').insert([req]).select().single();
    if (error) throw error; return data;
  }
  ensure(); const items = JSON.parse(fs.readFileSync(filePath)); items.push(req); fs.writeFileSync(filePath, JSON.stringify(items, null, 2)); return req;
};

const findByUser = async (userId) => {
  if (supabase) {
    const { data } = await supabase.from('requests').select('*').eq('user_id', userId);
    return data;
  }
  ensure(); const items = JSON.parse(fs.readFileSync(filePath)); return items.filter(i => i.user_id === userId);
};

const update = async (id, changes) => {
  if (supabase) {
    const { data, error } = await supabase.from('requests').update(changes).eq('id', id).select().single(); if (error) throw error; return data;
  }
  ensure(); const items = JSON.parse(fs.readFileSync(filePath)); const idx = items.findIndex(i=>i.id==id); if(idx<0) return null; items[idx]= {...items[idx], ...changes}; fs.writeFileSync(filePath, JSON.stringify(items, null,2)); return items[idx];
};

const remove = async (id) => {
  if (supabase) { const { data, error } = await supabase.from('requests').update({ deleted_at: new Date().toISOString(), status: 'deleted' }).eq('id', id).select().single(); if (error) throw error; return data; }
  ensure(); const items = JSON.parse(fs.readFileSync(filePath)); const idx = items.findIndex(i=>i.id==id); if(idx<0) return null; items[idx].deleted_at = new Date().toISOString(); items[idx].status = 'deleted'; fs.writeFileSync(filePath, JSON.stringify(items, null,2)); return items[idx];
};

module.exports = { create, findByUser, update, remove };
