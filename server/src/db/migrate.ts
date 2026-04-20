import { connectDatabase } from '../config/database';

async function migrate() {
  console.log('[Migrate] MongoDB mode: schema migrations are managed by Mongoose models.');
  const connected = await connectDatabase();
  if (!connected) {
    console.error('[Migrate] Cannot connect to MongoDB. Aborting.');
    process.exit(1);
  }

  console.log('[Migrate] No SQL migrations required.');
  process.exit(0);
}

migrate();
