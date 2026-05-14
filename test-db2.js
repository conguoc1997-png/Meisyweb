const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(process.cwd(), 'dev.db');
console.log('DB path:', dbPath);

try {
  const db = new Database(dbPath);
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables:', JSON.stringify(tables.map(t => t.name)));
  db.close();
} catch(e) {
  console.error('Error:', e.message);
}
