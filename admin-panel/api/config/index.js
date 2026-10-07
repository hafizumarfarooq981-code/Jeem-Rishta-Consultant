require('dotenv').config();
const path = require('path');

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'jeem_rishta_user_jwt_secret_key_2026_super_secure',
  adminJwtSecret: process.env.ADMIN_JWT_SECRET || 'jeem_rishta_admin_jwt_secret_key_2026_super_secure',
  dbPath: process.env.DATABASE_PATH ? path.resolve(__dirname, '../../', process.env.DATABASE_PATH) : path.resolve(__dirname, '../database/jeem_rishta.db'),
  superadmin: {
    username: process.env.SUPERADMIN_USERNAME || 'superadmin',
    password: process.env.SUPERADMIN_PASSWORD || 'Admin@JeemRishta2026',
    name: process.env.SUPERADMIN_NAME || 'Jeem Rishta Superadmin',
  },
  defaultWhatsappNumber: process.env.DEFAULT_WHATSAPP_NUMBER || '923001234567',
  appName: process.env.APP_NAME || 'Jeem Rishta Consultant'
};

module.exports = config;
