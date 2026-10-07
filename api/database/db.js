const fs = require('fs');
const path = require('path');
const config = require('../config');

// Path to sqlite db file
const defaultDbPath = path.resolve(__dirname, 'jeem_rishta.db');
const dbFilePath = fs.existsSync(config.dbPath) ? config.dbPath : defaultDbPath;

let dbInstance = null;
let initPromise = null;

// Sqlite compatibility wrapper around sql.js
class SqliteCompat {
  constructor(sqlDb) {
    this.db = sqlDb;
  }

  prepare(sql) {
    const db = this.db;
    return {
      all: (...args) => {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        const stmt = db.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },
      get: (...args) => {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        const stmt = db.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        const result = stmt.step() ? stmt.getAsObject() : undefined;
        stmt.free();
        return result;
      },
      run: (...args) => {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        db.run(sql, params);
        return { changes: db.getRowsModified() };
      }
    };
  }

  exec(sql) {
    this.db.exec(sql);
  }

  pragma(cmd) {
    try { this.db.exec(`PRAGMA ${cmd};`); } catch (e) {}
  }

  transaction(fn) {
    return (...args) => {
      this.db.exec('BEGIN TRANSACTION;');
      try {
        const res = fn(...args);
        this.db.exec('COMMIT;');
        return res;
      } catch (err) {
        this.db.exec('ROLLBACK;');
        throw err;
      }
    };
  }
}

async function ensureDb() {
  if (dbInstance) return dbInstance;
  if (!initPromise) {
    initPromise = (async () => {
      // 1. Try better-sqlite3 first (if available in current environment)
      try {
        const BetterSqlite3 = require('better-sqlite3');
        const nativeDb = new BetterSqlite3(dbFilePath);
        nativeDb.pragma('journal_mode = WAL');
        nativeDb.pragma('foreign_keys = ON');
        dbInstance = nativeDb;
        console.log('[DB] Connected via better-sqlite3');
        return dbInstance;
      } catch (e) {
        // Fallback to pure WebAssembly sql.js (Works 100% on Vercel serverless)
        console.log('[DB] better-sqlite3 unavailable, using WebAssembly sql.js fallback');
      }

      // 2. sql.js fallback
      const initSqlJs = require('sql.js');
      const SQL = await initSqlJs();
      let buffer = null;
      if (fs.existsSync(dbFilePath)) {
        buffer = fs.readFileSync(dbFilePath);
      }
      const sqlDb = buffer ? new SQL.Database(buffer) : new SQL.Database();
      dbInstance = new SqliteCompat(sqlDb);
      console.log('[DB] Connected via sql.js (WebAssembly SQLite)');
      return dbInstance;
    })();
  }
  return initPromise;
}

// Proxied database object for backward compatibility
const db = {
  prepare(sql) {
    if (!dbInstance) throw new Error('[DB] Database not initialized yet. Ensure ensureDb() is called.');
    return dbInstance.prepare(sql);
  },
  exec(sql) {
    if (!dbInstance) throw new Error('[DB] Database not initialized yet.');
    return dbInstance.exec(sql);
  },
  pragma(cmd) {
    if (dbInstance) dbInstance.pragma(cmd);
  },
  transaction(fn) {
    if (!dbInstance) throw new Error('[DB] Database not initialized yet.');
    return dbInstance.transaction(fn);
  },
  ensureDb
};

module.exports = db;
