import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { env } from './config/env';
import { testConnection } from './config/database';
import { connectRedis } from './config/redis';
import { initSocket } from './socket';
import { errorHandler, notFound } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { workerService } from './services/worker.service';

// Route imports
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import draftsRoutes from './routes/drafts.routes';
import feedbackRoutes from './routes/feedback.routes';
import exploreRoutes from './routes/explore.routes';
import opportunitiesRoutes from './routes/opportunities.routes';
import submissionsRoutes from './routes/submissions.routes';
import analyticsRoutes from './routes/analytics.routes';
import notificationsRoutes, { achievementsRouter } from './routes/notifications.routes';

const app = express();
const httpServer = createServer(app);

// ─── Global Middleware ───
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting (after Redis connects)
app.use('/api', generalLimiter);

// ─── Health Check ───
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: "Writers' Pub API is running",
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/drafts', draftsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/discover', exploreRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/achievements', achievementsRouter);

// ─── Error Handling ───
app.use(notFound);
app.use(errorHandler);

// ─── Server Startup ───
async function start() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║       Writers\' Pub — Backend API        ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // Connect to MongoDB Atlas
  const dbConnected = await testConnection();
  if (!dbConnected) {
    const message = '[Server] MongoDB unavailable. Set up MONGO_URI or set ALLOW_DEGRADED_START=true for non-production diagnostics.';
    if (!env.ALLOW_DEGRADED_START) {
      console.error(message);
      process.exit(1);
    }
    console.warn(`[Server] ⚠ ${message}`);
  }

  // Connect to Redis (non-fatal)
  const redisConnected = await connectRedis();
  if (!redisConnected) {
    console.warn('[Server] ⚠ Redis not available — rate limiting and caching disabled');
  }

  // Initialize Socket.IO
  initSocket(httpServer);

  // Initialize Background Workers
  workerService.init();

  // Start listening
  httpServer.listen(env.PORT, () => {
    console.log(`\n[Server] ✓ API running at http://localhost:${env.PORT}`);
    console.log(`[Server] ✓ Health check: http://localhost:${env.PORT}/api/health`);
    console.log(`[Server] ✓ Frontend CORS: ${env.FRONTEND_URL}`);
    console.log(`[Server] ✓ Environment: ${env.NODE_ENV}`);
    console.log(`[Server] ✓ Gemini AI: ${env.GEMINI_API_KEY ? 'Configured' : 'Not configured'}`);
    console.log('');
  });
}

start().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});

export { app, httpServer };
