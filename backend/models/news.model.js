const fs = require('fs');
const path = require('path');
const supabase = require('../database/supabaseClient');

const filePath = path.join(__dirname, '..', 'data', 'news.json');
const ensure = () => { const dir = path.dirname(filePath); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]'); };

const all = async () => {
  if (supabase) { const { data } = await supabase.from('news').select('*'); return data; }
  ensure(); return JSON.parse(fs.readFileSync(filePath));
};

const create = async (n) => {
  if (supabase) { const { data, error } = await supabase.from('news').insert([n]).select().single(); if (error) throw error; return data; }
  ensure(); const items = JSON.parse(fs.readFileSync(filePath)); items.push(n); fs.writeFileSync(filePath, JSON.stringify(items,null,2)); return n;
};

const remove = async (id) => {
  if (supabase) { const { data, error } = await supabase.from('news').update({ deleted_at: new Date().toISOString() }).eq('id', id).select().single(); if (error) throw error; return data; }
  ensure(); const items = JSON.parse(fs.readFileSync(filePath)); const idx = items.findIndex(i=>i.id==id); if(idx<0) return null; items[idx].deleted_at = new Date().toISOString(); fs.writeFileSync(filePath, JSON.stringify(items,null,2)); return items[idx];
};

module.exports = { all, create };
