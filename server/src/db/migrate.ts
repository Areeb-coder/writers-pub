import fs from 'fs';
import path from 'path';
import { pool, connectPostgres } from '../config/database';

async function migrate() {
  console.log('[Migrate] Starting PostgreSQL migrations...');
  
  const connected = await connectPostgres();
  if (!connected) {
    console.error('[Migrate] Cannot connect to PostgreSQL. Aborting.');
    process.exit(1);
  }

  const migrationsDir = path.join(__dirname, 'migrations');
  try {
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    console.log(`[Migrate] Found ${files.length} migration files.`);

    for (const file of files) {
      console.log(`[Migrate] Executing ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await pool.query(sql);
      console.log(`[Migrate] ✓ ${file} completed.`);
    }

    console.log('[Migrate] All PostgreSQL migrations completed successfully.');
    process.exit(0);
  } catch (err: any) {
    console.error('[Migrate] Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();

