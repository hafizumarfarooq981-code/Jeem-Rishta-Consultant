const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../database/db');

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Admin authorization required.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.adminJwtSecret);
    
    // Check if admin exists
    const admin = db.prepare('SELECT id, username, name, role FROM admin_users WHERE id = ?').get(decoded.id);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found or access revoked.'
      });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired admin session. Please log in again.'
    });
  }
}

module.exports = {
  authenticateAdmin
};
