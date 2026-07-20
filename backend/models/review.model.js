const fs = require('fs');
const path = require('path');
const supabase = require('../database/supabaseClient');

const filePath = path.join(__dirname, '..', 'data', 'reviews.json');
const ensure = () => { const dir = path.dirname(filePath); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]'); };

const create = async (r) => {
  if (supabase) { const { data, error } = await supabase.from('reviews').insert([r]).select().single(); if (error) throw error; return data; }
  ensure(); const items = JSON.parse(fs.readFileSync(filePath)); items.push(r); fs.writeFileSync(filePath, JSON.stringify(items, null,2)); return r;
};

const update = async (id, changes) => {
  if (supabase) { const { data, error } = await supabase.from('reviews').update(changes).eq('id', id).select().single(); if (error) throw error; return data; }
  ensure(); const items = JSON.parse(fs.readFileSync(filePath)); const idx=items.findIndex(i=>i.id==id); if(idx<0) return null; items[idx]={...items[idx],...changes}; fs.writeFileSync(filePath, JSON.stringify(items,null,2)); return items[idx];
};

module.exports = { create, update };
