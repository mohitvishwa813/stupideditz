import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config({path: './.env'});

const turso = createClient({ 
  url: process.env.TURSO_DATABASE_URL, 
  authToken: process.env.TURSO_AUTH_TOKEN 
});

async function run() {
  try {
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS bundle_promos (
        id TEXT PRIMARY KEY,
        badge_text TEXT,
        title TEXT,
        description TEXT,
        current_price REAL,
        original_price REAL,
        drive_link TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await turso.execute({
      sql: `INSERT INTO bundle_promos 
        (id, badge_text, title, description, current_price, original_price, drive_link) 
        VALUES ('main_promo', ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
        badge_text=excluded.badge_text, title=excluded.title, description=excluded.description,
        current_price=excluded.current_price, original_price=excluded.original_price, drive_link=excluded.drive_link`,
      args: [
        'Limited Time Cohort Bundle',
        'Unlock Every Premium Pack Instantly',
        'Get the Most Premium Assets, 9GB Basic Pack, Fusion Pack, and all SFX libraries (15GB+ total) for a one-time price. Everything you need for high-retention documentary editing.',
        1099,
        1795,
        'https://drive.google.com/drive/folders/1qpg_kNvsxW46e_Zmdh4c0JDdTMrULQDV?usp=sharing'
      ]
    });
    console.log('Successfully saved bundle promo!');
  } catch (err) {
    console.error(err);
  }
}
run();
