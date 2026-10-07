const db = require('../database/db');

/**
 * Log administrative activity into audit_logs table
 * @param {number|null} adminId - Admin user ID
 * @param {string} action - Action string (e.g. 'ADMIN_LOGIN', 'PROFILE_BLOCKED')
 * @param {string} targetType - 'profile', 'user', 'setting', 'auth'
 * @param {string} targetId - Identifier of target
 * @param {object|string} details - Additional non-sensitive context
 */
function logAdminActivity(adminId, action, targetType, targetId, details = null) {
  try {
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : (details || null);
    db.prepare(`
      INSERT INTO audit_logs (admin_id, action, target_type, target_id, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(adminId, action, targetType, targetId ? String(targetId) : null, detailsStr);
  } catch (err) {
    console.error('[AuditLog] Error logging activity:', err.message);
  }
}

module.exports = {
  logAdminActivity
};
