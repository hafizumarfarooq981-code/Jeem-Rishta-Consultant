const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const db = require('./database/db');

// Import route handlers
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();
app.set('trust proxy', 1);

// Security & CORS
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request body parser
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Ensure database is initialized before any handler
app.use(async (req, res, next) => {
  try {
    await db.ensureDb();
    next();
  } catch (err) {
    console.error('[DB Init Error]:', err);
    res.status(500).json({ success: false, message: 'Database connection failed.' });
  }
});

// Health check endpoint
const healthHandler = (req, res) => {
  res.json({
    success: true,
    status: 'ONLINE',
    app: config.appName || 'Jeem Rishta Consultant',
    version: '1.0.0',
    platform: 'Vercel Serverless',
    timestamp: new Date().toISOString()
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Mount API routes with both /api prefix and direct prefix for Vercel rewrites compatibility
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/profiles', profileRoutes);
app.use('/profiles', profileRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/settings', settingsRoutes);
app.use('/settings', settingsRoutes);

// 404 Handler for API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[API Error]:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error.'
  });
});

// For local testing
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
