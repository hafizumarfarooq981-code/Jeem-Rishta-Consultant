const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { initDb } = require('./database/initDb');

// Import route handlers
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Initialize database schema and defaults
initDb();

const app = express();
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: '*', // Allows mobile apps and web admin panel
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api/', globalLimiter);

// Specific stricter limiter for Auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' }
});
app.use('/api/auth/', authLimiter);
app.use('/api/admin/login', authLimiter);

// Request body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ONLINE',
    app: config.appName,
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve Admin Web Portal & Mobile Website
const path = require('path');
const fs = require('fs');

const adminDist = path.resolve(__dirname, '../../admin-panel/dist');
const mobileDist = path.resolve(__dirname, '../../mobile-app/dist');

if (fs.existsSync(adminDist)) {
  app.use('/admin', express.static(adminDist));
  app.get(['/admin', '/admin/*'], (req, res) => {
    res.sendFile(path.join(adminDist, 'index.html'));
  });
}

if (fs.existsSync(mobileDist)) {
  app.use(express.static(mobileDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/admin')) return next();
    res.sendFile(path.join(mobileDist, 'index.html'));
  });
}

// 404 Handler for API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.'
  });
});

// Start Server
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`  ${config.appName} — Backend Server Online`);
    console.log(`  Port: http://localhost:${config.port}`);
    console.log(`  Environment: ${config.nodeEnv}`);
    console.log(`  Public API: http://localhost:${config.port}/api/health`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
