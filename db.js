const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// DB_PATH can point to a persistent disk in production (e.g. /var/data/students.db)
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'students.db');
if (dbPath !== ':memory:') fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL UNIQUE,
    course     TEXT    NOT NULL,
    age        INTEGER NOT NULL CHECK (age BETWEEN 5 AND 120),
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
