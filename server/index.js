// server/index.js — Express Application Entry Point
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './src/config/env.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { authRoutes } from './src/routes/auth.js';
import { complaintRoutes } from './src/routes/complaints.js';
import { departmentRoutes } from './src/routes/departments.js';
import { routingRuleRoutes } from './src/routes/routingRules.js';
import { uploadRoutes } from './src/routes/uploads.js';
import { reviewRoutes } from './src/routes/review.js';
import { insightRoutes } from './src/routes/insights.js';
import { adminRoutes } from './src/routes/admin.js';
import { debugRoutes } from './src/routes/debug.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

app.options('*', cors());
app.use(compression());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Static uploads (served with auth check in route handler)
app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/department-officers', (req, res, next) => {
  req.url = '/officers' + req.url;
  return departmentRoutes(req, res, next);
});
app.use('/api/routing-rules', routingRuleRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/review-queue', reviewRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/debug', debugRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

let currentPort = env.PORT || 5000;

function startServer(portToTry) {
  const server = app.listen(portToTry, () => {
    console.log(`🚀 CityPulse AI server running on port ${portToTry} [${env.NODE_ENV}]`);
    console.log(`   Health check: http://localhost:${portToTry}/api/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${portToTry} is in use. Trying port ${portToTry + 1}...`);
      setTimeout(() => startServer(portToTry + 1), 300);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

startServer(currentPort);

export default app;
