import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export type DB = Database.Database;

/** Opens (or creates) the SQLite database and ensures the schema exists. Use ":memory:" for tests. */
export function createDatabase(file: string): DB {
  if (file !== ":memory:") fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      priority    TEXT    NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
      status      TEXT    NOT NULL DEFAULT 'todo'   CHECK (status IN ('todo','in_progress','completed')),
      due_date    TEXT,
      created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  `);
  return db;
}
