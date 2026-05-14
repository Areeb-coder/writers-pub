import mongoose from 'mongoose';
import { Pool } from 'pg';
import { env } from './env';

// PostgreSQL configuration (Primary)
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.DATABASE_URL.includes('sslmode=require') || env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
});

function getErrorDetail(err: unknown) {
  if (err && typeof err === 'object') {
    const maybeErr = err as any;
    return maybeErr.stack || maybeErr.message || maybeErr.code || JSON.stringify(maybeErr);
  }
  return String(err);
}

export async function connectPostgres() {
  try {
    const client = await pool.connect();
    console.log('[DB] Connected to PostgreSQL');
    
    // Check for pgvector support
    try {
      await client.query('SELECT "vector" FROM pg_extension WHERE extname = \'vector\'');
      console.log('[DB] pgvector extension detected');
    } catch (e) {
      console.warn('[DB] pgvector extension not found or not accessible.');
    }
    
    client.release();
    return true;
  } catch (err: any) {
    console.error('[DB] PostgreSQL connection failed:', getErrorDetail(err));
    return false;
  }
}

export async function connectDatabase() {
  console.log('[DB] Initializing database connections...');
  const pgConnected = await connectPostgres();
  
  let mongoConnected = false;
  if (env.MONGO_URI) {
    try {
      // NOTE: We allow buffering (default) so transient disconnects don't crash auth.
      await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
        maxPoolSize: 20,
      });
      console.log('[DB] Connected to MongoDB Atlas');
      mongoConnected = true;
    } catch (err: any) {
      console.error('[DB] MongoDB connection failed:', getErrorDetail(err));
    }
  }

  return { pgConnected, mongoConnected };
}

export async function testConnection() {
  try {
    await pool.query('SELECT NOW()');
    return true;
  } catch (err) {
    const status = await connectDatabase();
    return status.pgConnected;
  }
}

