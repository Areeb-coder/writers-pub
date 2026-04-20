import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

type ErrorLike = Error & {
  status?: number;
  statusCode?: number;
  type?: string;
  code?: string;
  cause?: { code?: string };
  errors?: Array<{ code?: string }>;
};

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  const typedErr = err as ErrorLike;
  const fallbackMessage = 'Internal server error';
  const errorMessage = typeof err.message === 'string' && err.message.trim() ? err.message : fallbackMessage;

  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: err.message,
      message: err.message,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  if (typedErr?.type === 'entity.parse.failed' || typedErr?.status === 400) {
    const response: ApiResponse = {
      success: false,
      error: 'Invalid JSON payload',
      message: 'Invalid JSON payload',
    };
    res.status(400).json(response);
    return;
  }

  const isDbUnavailable =
    typedErr?.name === 'AggregateError' ||
    typedErr?.name === 'MongoServerSelectionError' ||
    typedErr?.name === 'MongooseServerSelectionError' ||
    typedErr?.name === 'MongoNetworkError' ||
    typedErr?.name === 'MongooseError' ||
    typedErr?.code === 'ECONNREFUSED' ||
    typedErr?.message?.includes('querySrv ECONNREFUSED') ||
    typedErr?.message?.includes('buffering timed out') ||
    typedErr?.message?.includes('initial connection is complete') ||
    typedErr?.message?.includes('ECONNREFUSED') ||
    typedErr?.cause?.code === 'ECONNREFUSED' ||
    typedErr?.errors?.some((item) => item?.code === 'ECONNREFUSED');
  if (isDbUnavailable) {
    const response: ApiResponse = {
      success: false,
      error: 'Database is unavailable. Please try again shortly.',
      message: 'Database is unavailable. Please try again shortly.',
    };
    res.status(503).json(response);
    return;
  }

  console.error('[Error]', err.stack || err.message);

  const response: ApiResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' ? fallbackMessage : errorMessage,
    message: process.env.NODE_ENV === 'production' ? fallbackMessage : errorMessage,
  };
  res.status(500).json(response);
}

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError('Resource not found', 404));
}
