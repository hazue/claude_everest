const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

require('dotenv').config();

const dbFile = process.env.DB_FILE || './data/app.db';
const resolved = path.resolve(process.cwd(), dbFile);
fs.mkdirSync(path.dirname(resolved), { recursive: true });

const db = new DatabaseSync(resolved);
db.exec('PRAGMA foreign_keys = ON');

// node:sqlite's DatabaseSync has no built-in transaction helper (unlike better-sqlite3).
// This wraps a synchronous function in BEGIN/COMMIT, rolling back on error.
db.transaction = function transaction(fn) {
  return (...args) => {
    db.exec('BEGIN');
    try {
      const result = fn(...args);
      db.exec('COMMIT');
      return result;
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  };
};

module.exports = db;
