import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types';

let io: Server;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/ws',
  });

  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user as JwtPayload;
    console.log(`[Socket] User connected: ${user.userId}`);

    // Join user's personal room for notifications
    socket.join(`user:${user.userId}`);

    // Join role-based rooms
    socket.join(`role:${user.role}`);

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${user.userId}`);
    });

    // Draft collaboration - join draft room
    socket.on('join:draft', (draftId: string) => {
      socket.join(`draft:${draftId}`);
    });

    socket.on('leave:draft', (draftId: string) => {
      socket.leave(`draft:${draftId}`);
    });
  });

  console.log('[Socket] Socket.IO initialized');
  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

// Emit helpers
export function emitToUser(userId: string, event: string, data: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

export function emitToDraft(draftId: string, event: string, data: any) {
  if (io) {
    io.to(`draft:${draftId}`).emit(event, data);
  }
}

export const SocketEvents = {
  FEEDBACK_RECEIVED: 'feedback:received',
  SUBMISSION_UPDATE: 'submission:update',
  AI_READY: 'ai:ready',
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
  NOTIFICATION: 'notification',
  USER_FEEDBACK_RECEIVED: 'user.feedback_received',
  USER_SUBMISSION_UPDATE: 'user.submission_update',
  USER_AI_READY: 'user.ai_ready',
} as const;
