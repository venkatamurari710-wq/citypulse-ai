// server/src/middleware/errorHandler.js — Global Error Handler
import { env } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  const isDev = env.NODE_ENV === 'development';

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB || 25}MB.` });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Unexpected file field.' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Supabase connection / network error
  if (err.message && (err.message.includes('fetch failed') || err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED'))) {
    return res.status(503).json({
      error: 'Database connection failed. Please configure real SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env.',
      ...(isDev && { originalError: err.message }),
    });
  }

  const status = err.status || err.statusCode || 500;
  console.error(`[ERROR] ${err.message}`, isDev ? err.stack : '');

  res.status(status).json({
    error: status === 500 ? (err.message || 'Internal server error') : err.message,
    ...(isDev && { details: err.message, stack: err.stack }),
  });
}

export function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
