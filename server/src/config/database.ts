import mongoose from 'mongoose';
import { Pool } from 'pg';
import { env } from './env';

// MongoDB configuration (Legacy/Co-existence)
mongoose.set('bufferCommands', false);

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
    
    // Check for pgvector support (as requested in Phase 1.4)
    try {
      await client.query('SELECT "vector" FROM pg_extension WHERE extname = \'vector\'');
      console.log('[DB] pgvector extension detected');
    } catch (e) {
      console.warn('[DB] pgvector extension not found or not accessible. Vector queries might fail.');
    }
    
    client.release();
    return true;
  } catch (err: any) {
    console.error('[DB] PostgreSQL connection failed:', getErrorDetail(err));
    return false;
  }
}

export async function connectDatabase() {
  // We attempt to connect to both if URIs are provided, 
  // but PostgreSQL is the primary target for this task.
  const pgConnected = await connectPostgres();
  
  let mongoConnected = false;
  if (env.MONGO_URI) {
    try {
      await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 20,
      });
      console.log('[DB] Connected to MongoDB Atlas');
      mongoConnected = true;
    } catch (err: any) {
      console.warn('[DB] MongoDB connection failed (non-fatal if using PostgreSQL):', getErrorDetail(err));
    }
  }

  return pgConnected;
}

export async function testConnection() {
  try {
    await pool.query('SELECT NOW()');
    return true;
  } catch (err) {
    return connectDatabase();
  }
}

