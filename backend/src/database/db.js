const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Ensure database directory exists
const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(config.dbPath, {
  verbose: config.nodeEnv === 'development' ? null : null
});

// Enable WAL mode for high concurrent read performance & pragmas
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;
