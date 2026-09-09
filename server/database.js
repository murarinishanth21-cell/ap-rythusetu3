const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'rythusetu.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    role TEXT,
    name TEXT,
    district TEXT,
    mobile TEXT,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS crops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_id TEXT,
    farmer_name TEXT,
    district TEXT,
    crop TEXT,
    variety TEXT,
    qty INTEGER,
    price REAL,
    quality TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'Available'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS grievances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_id TEXT,
    district TEXT,
    description TEXT,
    status TEXT DEFAULT 'Open'
  )`);
  
  // Insert default admin if not exists
  db.get("SELECT id FROM users WHERE role = 'admin'", (err, row) => {
    if (!row) {
      db.run("INSERT INTO users (id, role, name, password) VALUES ('admin', 'admin', 'AP Govt Admin', 'admin123')");
    }
  });
});

module.exports = db;
