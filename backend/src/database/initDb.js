const fs = require('fs');
const path = require('path');
const db = require('./db');
const config = require('../config');
const { hashPassword } = require('../utils/password');

function initDb() {
  console.log('[DB] Initializing database schema...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Execute schema
  db.exec(schemaSql);
  console.log('[DB] Database tables and indexes created successfully.');

  // Check and seed default Super Admin
  const existingAdmin = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(config.superadmin.username);
  if (!existingAdmin) {
    const hashedPassword = hashPassword(config.superadmin.password);
    db.prepare(`
      INSERT INTO admin_users (username, password_hash, name, role)
      VALUES (?, ?, ?, 'superadmin')
    `).run(config.superadmin.username, hashedPassword, config.superadmin.name);
    console.log(`[DB] Superadmin created: username="${config.superadmin.username}"`);
  } else {
    console.log('[DB] Superadmin already exists.');
  }

  // Check and seed default Admin Settings
  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO admin_settings (setting_key, setting_value)
    VALUES (?, ?)
  `);

  insertSetting.run('admin_whatsapp_number', config.defaultWhatsappNumber);
  insertSetting.run('app_name', config.appName);
  insertSetting.run('support_email', 'support@jeemrishta.com');
  insertSetting.run('support_phone', config.defaultWhatsappNumber);
  insertSetting.run('terms_and_conditions', 'Welcome to Jeem Rishta Consultant. By using this service, you agree that your matrimonial information is submitted voluntarily. Contact details will be kept private and accessible only to authorized consultants to protect family privacy. User-to-user direct harassment is strictly prohibited.');
  insertSetting.run('privacy_policy', 'Jeem Rishta Consultant respects your personal and family privacy. Contact numbers, guardian details, and full physical addresses are strictly private and never displayed publicly. Only city and public matrimonial criteria are visible to other users.');

  console.log('[DB] Default admin settings initialized.');
}

if (require.main === module) {
  initDb();
}

module.exports = { initDb };
