import { Pool } from 'pg';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const useSQLite = !process.env.DATABASE_URL;
let pgPool: Pool | null = null;
let sqliteDb: sqlite3.Database | null = null;

if (useSQLite) {
  const dbDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, 'placementor.db');
  console.log(`[Database] Using SQLite at: ${dbPath}`);
  sqliteDb = new sqlite3.Database(dbPath);
} else {
  console.log('[Database] Using PostgreSQL connection pool');
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
}

export const getDbMode = () => (useSQLite ? 'sqlite' : 'postgres');

export const query = async (text: string, params: any[] = []): Promise<any> => {
  if (useSQLite) {
    return new Promise((resolve, reject) => {
      // Convert PostgreSQL $1, $2 parameters to SQLite ? placeholders
      const sqliteText = text.replace(/\$\d+/g, '?');
      const isInsertOrUpdate = /^\s*(insert|update|delete)/i.test(text);
      const isSelect = /^\s*select/i.test(text);

      if (isSelect) {
        sqliteDb!.all(sqliteText, params, (err, rows) => {
          if (err) {
            console.error(`[Database Error] SQL: ${sqliteText}`, err);
            return reject(err);
          }
          resolve({ rows });
        });
      } else {
        sqliteDb!.run(sqliteText, params, function (err) {
          if (err) {
            console.error(`[Database Error] SQL: ${sqliteText}`, err);
            return reject(err);
          }
          // Emulatepg return structure
          resolve({
            rows: [],
            rowCount: this.changes,
            lastID: this.lastID,
          });
        });
      }
    });
  } else {
    const res = await pgPool!.query(text, params);
    return res;
  }
};

export const getSqliteRaw = (): sqlite3.Database | null => sqliteDb;
