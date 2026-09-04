'use strict';

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

dotenv.config();

// ── Startup guard ──────────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set.');
  if (process.env.NODE_ENV === 'production') process.exit(1);
  else console.warn('WARNING: Running without JWT_SECRET. Set it in .env before any real use.');
}

const app = express();

app.set('trust proxy', 1);

// ── Security middleware ────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      scriptSrc:  ["'self'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https:', 'wss:'],
      fontSrc:    ["'self'", 'https:', 'data:'],
      objectSrc:  ["'none'"],
      frameSrc:   ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
}));

// ── Rate limiting ──────────────────────────────────────────────────────────
const limit = (windowMs, max, message) => rateLimit({
  windowMs, max,
  message: { error: message },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health'
});

app.use('/api/', limit(15 * 60 * 1000, process.env.NODE_ENV === 'production' ? 100 : 1000, 'Too many requests'));
app.use('/api/v1/auth/login',    limit(15 * 60 * 1000, process.env.NODE_ENV === 'production' ? 10 : 100, 'Too many login attempts'));
app.use('/api/v1/auth/register', limit(60 * 60 * 1000, process.env.NODE_ENV === 'production' ? 5  : 50,  'Too many registration attempts'));

app.use(compression());

// ── CORS ──────────────────────────────────────────────────────────────────
const buildAllowedOrigins = () => {
  const origins = [];
  if (process.env.NODE_ENV !== 'production') {
    origins.push(
      'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173',
      'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:4173'
    );
  }
  if (process.env.FRONTEND_URL) origins.push(process.env.FRONTEND_URL);
  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean).forEach((o) => origins.push(o));
  }
  return origins;
};

const allowedOrigins = buildAllowedOrigins();

app.use(cors({
  origin: (origin, cb) => {
    if (!origin && process.env.NODE_ENV !== 'production') return cb(null, true);
    if (!origin) return cb(new Error('Origin required in production'));
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  maxAge: 86400
}));

// ── Logging ────────────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Body parsing ───────────────────────────────────────────────────────────
// 100 KB is generous for a task manager; 10 MB was a DoS risk
app.use(express.json({ limit: '100kb', strict: true }));
app.use(express.urlencoded({ extended: true, limit: '100kb', parameterLimit: 20 }));
app.use(cookieParser());

// ── Database ───────────────────────────────────────────────────────────────
const connectDB = require('./config/db');

// ── Routes ─────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: process.env.npm_package_version || '2.0.0'
  });
});

// All API routes under /api/v1/
app.use('/api/v1/auth',  authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/user',  userRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'TaskFlow API v2',
    version: '2.0.0',
    endpoints: { health: '/api/health', v1: '/api/v1/' }
  });
});

// ── 404 ────────────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Not Found', message: `${req.method} ${req.originalUrl} not found` });
});

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';

  if (err.message?.includes('CORS')) {
    return res.status(403).json({ success: false, error: 'CORS Error', message: 'Origin not allowed' });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, error: 'Validation Error', message: messages.join('. ') });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ success: false, error: 'Conflict', message: `${field} already in use` });
  }

  const status = err.statusCode || err.status || 500;
  const message = isProd && status === 500 ? 'Internal Server Error' : err.message;

  if (!isProd) console.error(err);

  res.status(status).json({ success: false, error: err.name || 'Error', message });
});

// ── Server startup ─────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 5001;
const HOST = process.env.HOST || '0.0.0.0';

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, HOST, () => {
    console.log(`TaskFlow API running on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
    console.log(`API base: http://localhost:${PORT}/api/v1`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received – shutting down…`);
    server.close(() => { console.log('Server closed.'); process.exit(0); });
    setTimeout(() => process.exit(1), 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  return server;
};

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  if (process.env.NODE_ENV !== 'production') process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

// Only bind to a port when run directly (not when required by tests)
if (require.main === module) {
  start().catch((err) => { console.error('Startup failed:', err); process.exit(1); });
}

module.exports = app;
