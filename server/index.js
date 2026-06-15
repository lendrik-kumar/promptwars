'use strict';

require('dotenv').config();

const express      = require('express');
const path         = require('path');
const helmet       = require('helmet');
const cors         = require('cors');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const jwt          = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const smsRoutes     = require('./routes/sms');
const swapRoutes    = require('./routes/swap');
const mohallaRoutes = require('./routes/mohalla');
const receiptRoutes = require('./routes/receipt');
const copilotRoutes = require('./routes/copilot');
const walletRoutes  = require('./routes/wallet');
const billRoutes    = require('./routes/bill');
const travelRoutes  = require('./routes/travel');
const authRoutes    = require('./routes/auth');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-fallback-key-replace-in-prod';

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
    },
  },
  xContentTypeOptions: false,
}));

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  'http://localhost:4173', // vite preview
  'http://localhost:8080',
  'http://localhost',
];
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods:     ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
  credentials: true,
}));

// ── Request logging ───────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Body parsers & Cookies ───────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// ── JWT Anonymous Auth Middleware ───────────────────────────────────────────
function requireAuth(req, res, next) {
  let sessionId;
  const token = req.cookies?.session_token;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      sessionId = decoded.sessionId;
      req.userId = decoded.userId || null;
    } catch (err) {
      console.warn('Invalid JWT token, minting new session');
    }
  }

  // If no valid JWT, adopt the legacy header or create a new one
  if (!sessionId) {
    sessionId = req.header('x-session-id') || uuidv4();
    const newToken = jwt.sign({ sessionId }, JWT_SECRET, { expiresIn: '30d' });
    res.cookie('session_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  }

  req.sessionId = sessionId;
  next();
}

// ── Rate limiting ──────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              200,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler: (req, res, next, options) => {
    console.warn(`[RATE LIMIT EXCEEDED] ${req.ip} - ${req.method} ${req.url}`);
    res.status(options.statusCode).send(options.message);
  },
  message:          { success: false, error: 'Too many requests, please try again later.' },
});

// Tighter limit for Groq-powered endpoints (expensive calls)
const aiLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              30,
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { success: false, error: 'AI request limit reached. Please wait 15 minutes.' },
});

app.use(globalLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    groqKey:   !!process.env.GROQ_API_KEY,
  });
});

// ── API routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',    requireAuth, authRoutes); // requireAuth ensures sessionId exists
app.use('/api/sms',     requireAuth, aiLimiter, smsRoutes);
app.use('/api/swap',    requireAuth, swapRoutes);
app.use('/api/mohalla', requireAuth, aiLimiter, mohallaRoutes);
app.use('/api/receipt', requireAuth, aiLimiter, receiptRoutes);
app.use('/api/copilot', requireAuth, aiLimiter, copilotRoutes);
app.use('/api/wallet',  requireAuth, walletRoutes);
app.use('/api/bill',    requireAuth, aiLimiter, billRoutes);
app.use('/api/travel',  requireAuth, aiLimiter, travelRoutes);

// ── 404 & error handlers for API routes ──────────────────────────────────────────
app.use('/api', notFound);
app.use('/api', errorHandler);

// ── Serve React Frontend in Production ─────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React frontend app
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Catch-all route to serve the React index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
} else {
  // In development, handle unknown non-API routes with standard 404
  app.use(notFound);
}

// Global error handler
app.use(errorHandler);

// ── Start server ───────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌱 CarbonIQ server running on http://localhost:${PORT}`);
  console.log(`   Groq API key: ${process.env.GROQ_API_KEY ? '✅ configured' : '⚠️  NOT SET — AI features will fail'}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app; // exported for testing
