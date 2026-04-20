import mongoose from 'mongoose';
import { env } from './env';

mongoose.set('bufferCommands', false);

function getErrorDetail(err: unknown) {
  if (err && typeof err === 'object') {
    const maybeErr = err as any;
    return maybeErr.stack || maybeErr.message || maybeErr.code || JSON.stringify(maybeErr);
  }
  return String(err);
}

export async function connectDatabase() {
  try {
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 20,
    });
    console.log('[DB] Connected to MongoDB Atlas');
    return true;
  } catch (err: any) {
    console.error('[DB] Connection failed:', getErrorDetail(err));
    return false;
  }
}

export async function testConnection() {
  if (mongoose.connection.readyState === 1) return true;
  return connectDatabase();
}
