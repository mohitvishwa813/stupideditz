import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('❌ [Backend DB] Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in environment!');
}

export const db = createClient({
  url: url || 'libsql://stupideditz-stupideditz-business.aws-ap-south-1.turso.io',
  authToken: authToken || '',
});

// Initialize database schema for single authoritative users table
export async function initDbSchema() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT,
        avatar_url TEXT,
        role TEXT DEFAULT 'student',
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure phone column exists
    try {
      await db.execute(`ALTER TABLE users ADD COLUMN phone TEXT`);
    } catch {
      // Column may already exist
    }

    console.log('⚡ [Backend DB] Turso Cloud DB connection & users table initialized successfully!');
  } catch (err) {
    console.error('❌ [Backend DB] Table initialization error:', err);
  }
}
