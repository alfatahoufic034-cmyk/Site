const fs = require('fs');
const path = require('path');
const supabase = require('../database/supabaseClient');

const filePath = path.join(__dirname, '..', 'data', 'contacts.json');
const ensure = () => { const dir = path.dirname(filePath); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]'); };

const create = async (msg) => {
  if (supabase) { const { data, error } = await supabase.from('contacts').insert([msg]).select().single(); if (error) throw error; return data; }
  ensure(); const items = JSON.parse(fs.readFileSync(filePath)); items.push(msg); fs.writeFileSync(filePath, JSON.stringify(items, null, 2)); return msg;
};

module.exports = { create };
