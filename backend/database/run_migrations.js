const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
  const conn = process.env.PG_CONNECTION_STRING || process.env.SUPABASE_DB_URL;
  if (!conn) {
    console.error('PG_CONNECTION_STRING or SUPABASE_DB_URL is required to run migrations');
    process.exit(1);
  }
  const client = new Client({ connectionString: conn });
  await client.connect();
  const dir = path.join(__dirname, 'supabase_sql');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  for (const f of files) {
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    console.log('Running', f);
    try { await client.query(sql); console.log('OK', f); } catch (e) { console.error('Failed', f, e.message); await client.end(); process.exit(1); }
  }
  await client.end();
  console.log('Migrations complete');
}

if (require.main === module) run();
