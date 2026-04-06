/**
 * database/db.js
 *
 * Uses node-sqlite3-wasm (pure WASM — no native compilation needed).
 * Exposes a better-sqlite3–compatible shim so all command files work
 * without any changes: db.prepare(sql).run(...), .get(...), .all(...)
 */

const path = require('path');
const fs   = require('fs');
const logger = require('../utils/logger');

const DB_PATH  = path.join(__dirname, '..', 'data', 'bot.db');

// ── Compatibility shim ──────────────────────────────────────────────────
// Wraps node-sqlite3-wasm so it looks like better-sqlite3 to callers.

class Statement {
    constructor(wasm, sql) {
        this._wasm = wasm;
        this._sql  = sql;
    }

    /** Normalize variadic / array args to a flat array for node-sqlite3-wasm */
    _normalize(args) {
        if (args.length === 0) return [];
        if (args.length === 1 && Array.isArray(args[0])) return args[0];
        return args;
    }

    run(...args) {
        this._wasm.run(this._sql, this._normalize(args));
        return this;
    }

    get(...args) {
        return this._wasm.get(this._sql, this._normalize(args));
    }

    all(...args) {
        return this._wasm.all(this._sql, this._normalize(args));
    }
}

class CompatDb {
    constructor(wasmDb) {
        this._db = wasmDb;
    }

    prepare(sql) {
        return new Statement(this._db, sql);
    }

    exec(sql) {
        this._db.exec(sql);
        return this;
    }

    pragma(str) {
        try { this._db.exec(`PRAGMA ${str};`); } catch { /* ignored */ }
        return this;
    }
}

// ── Module-level db instance ────────────────────────────────────────────
let db;

/**
 * Initialize the SQLite database and create all required tables.
 * Must be called once at startup before getDb() is used.
 */
function initDatabase() {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    const { Database } = require('node-sqlite3-wasm');
    const wasmDb = new Database(DB_PATH);

    db = new CompatDb(wasmDb);

    // Performance pragmas
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');

    // ── Warnings ───────────────────────────────────────────────────────
    db.exec(`
        CREATE TABLE IF NOT EXISTS warnings (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id     TEXT    NOT NULL,
            user_id      TEXT    NOT NULL,
            moderator_id TEXT    NOT NULL,
            reason       TEXT    NOT NULL,
            created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ── Reminders ──────────────────────────────────────────────────────
    db.exec(`
        CREATE TABLE IF NOT EXISTS reminders (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    TEXT    NOT NULL,
            channel_id TEXT    NOT NULL,
            guild_id   TEXT    NOT NULL,
            message    TEXT    NOT NULL,
            remind_at  INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ── Todos ──────────────────────────────────────────────────────────
    db.exec(`
        CREATE TABLE IF NOT EXISTS todos (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    TEXT    NOT NULL,
            guild_id   TEXT    NOT NULL,
            task       TEXT    NOT NULL,
            completed  INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ── Guild Config ───────────────────────────────────────────────────
    db.exec(`
        CREATE TABLE IF NOT EXISTS guild_config (
            guild_id         TEXT PRIMARY KEY,
            log_channel_id   TEXT,
            autorole_id      TEXT,
            mute_role_id     TEXT,
            cooldown_seconds INTEGER DEFAULT 3
        )
    `);

    // ── Custom Commands ────────────────────────────────────────────────
    db.exec(`
        CREATE TABLE IF NOT EXISTS custom_commands (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id   TEXT NOT NULL,
            name       TEXT NOT NULL,
            response   TEXT NOT NULL,
            created_by TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(guild_id, name)
        )
    `);

    // ── Schedules ─────────────────────────────────────────────────────
    db.exec(`
        CREATE TABLE IF NOT EXISTS schedules (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id     TEXT NOT NULL,
            channel_id   TEXT NOT NULL,
            user_id      TEXT NOT NULL,
            title        TEXT NOT NULL,
            description  TEXT,
            scheduled_at INTEGER NOT NULL,
            created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    logger.info('All database tables ready.');
}

/**
 * Return the shared database instance.
 * Throws if called before initDatabase().
 */
function getDb() {
    if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
    return db;
}

module.exports = { initDatabase, getDb };
