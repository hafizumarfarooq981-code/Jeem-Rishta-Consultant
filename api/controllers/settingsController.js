const db = require('../database/db');
const { logAdminActivity } = require('../utils/auditLogger');

/**
 * Public Settings endpoint (Mobile App queries this)
 */
function getPublicSettings(req, res) {
  try {
    const rows = db.prepare('SELECT setting_key, setting_value FROM admin_settings').all();
    const settings = {};
    rows.forEach(r => {
      settings[r.setting_key] = r.setting_value;
    });

    return res.json({
      success: true,
      data: {
        admin_whatsapp_number: settings.admin_whatsapp_number || '923001234567',
        app_name: settings.app_name || 'Jeem Rishta Consultant',
        support_email: settings.support_email || 'support@jeemrishta.com',
        support_phone: settings.support_phone || '923001234567',
        terms_and_conditions: settings.terms_and_conditions || '',
        privacy_policy: settings.privacy_policy || ''
      }
    });
  } catch (err) {
    console.error('[Settings getPublicSettings] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
}

/**
 * Admin: Get all settings
 */
function getAdminSettings(req, res) {
  try {
    const rows = db.prepare('SELECT * FROM admin_settings').all();
    const settings = {};
    rows.forEach(r => {
      settings[r.setting_key] = r.setting_value;
    });

    return res.json({
      success: true,
      settings
    });
  } catch (err) {
    console.error('[Settings getAdminSettings] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin settings.' });
  }
}

/**
 * Admin: Update settings
 */
function updateAdminSettings(req, res) {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid settings payload.' });
    }

    const upsertStmt = db.prepare(`
      INSERT INTO admin_settings (setting_key, setting_value, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(setting_key) DO UPDATE SET
        setting_value = excluded.setting_value,
        updated_at = datetime('now')
    `);

    const updateTx = db.transaction(() => {
      for (const [key, val] of Object.entries(settings)) {
        upsertStmt.run(key, String(val));
      }
    });

    updateTx();

    logAdminActivity(
      req.admin.id,
      'SETTINGS_UPDATED',
      'setting',
      'admin_settings',
      `Updated settings: ${Object.keys(settings).join(', ')}`
    );

    return res.json({
      success: true,
      message: 'Settings updated successfully.'
    });
  } catch (err) {
    console.error('[Settings updateAdminSettings] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
}

module.exports = {
  getPublicSettings,
  getAdminSettings,
  updateAdminSettings
};
