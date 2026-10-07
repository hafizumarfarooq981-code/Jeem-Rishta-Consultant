const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../database/db');
const { hashPassword, comparePassword } = require('../utils/password');

function createToken(user) {
  return jwt.sign(
    { id: user.id, mobile_number: user.mobile_number },
    config.jwtSecret,
    { expiresIn: '30d' }
  );
}

function register(req, res) {
  try {
    const { mobile_number, password } = req.body;

    // Check if phone already registered
    const existing = db.prepare('SELECT id FROM users WHERE mobile_number = ?').get(mobile_number);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This mobile number is already registered. Please log in.'
      });
    }

    const hashedPassword = hashPassword(password);
    const result = db.prepare(`
      INSERT INTO users (mobile_number, password_hash, status)
      VALUES (?, ?, 'active')
    `).run(mobile_number, hashedPassword);

    const newUser = {
      id: result.lastInsertRowid,
      mobile_number,
      status: 'active'
    };

    const token = createToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser.id,
        mobile_number: newUser.mobile_number
      }
    });
  } catch (err) {
    console.error('[Auth register] Error:', err);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during registration. Please try again.'
    });
  }
}

function login(req, res) {
  try {
    const { mobile_number, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE mobile_number = ?').get(mobile_number);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number or password.'
      });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact Admin.'
      });
    }

    const passwordMatch = comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number or password.'
      });
    }

    // Update last login
    db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(user.id);

    const token = createToken(user);

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        mobile_number: user.mobile_number,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('[Auth login] Error:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.'
    });
  }
}

function getMe(req, res) {
  try {
    const user = db.prepare(`
      SELECT id, mobile_number, status, created_at, last_login_at,
      (SELECT COUNT(*) FROM rishta_profiles WHERE user_id = users.id AND status != 'removed') AS profile_count
      FROM users WHERE id = ?
    `).get(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('[Auth getMe] Error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

function changePassword(req, res) {
  try {
    const { current_password, new_password, confirm_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    if (confirm_password && new_password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'New passwords do not match.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user || !comparePassword(current_password, user.password_hash)) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    const newHashed = hashPassword(new_password);
    db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").run(newHashed, user.id);

    return res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    console.error('[Auth changePassword] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
}

function deleteAccount(req, res) {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your password to confirm permanent account deletion.'
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user || !comparePassword(password, user.password_hash)) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password. Account deletion canceled.'
      });
    }

    // Cascade delete user and all associated matrimonial records
    db.prepare('DELETE FROM users WHERE id = ?').run(user.id);

    return res.json({
      success: true,
      message: 'Your account and all associated rishta profiles have been permanently deleted.'
    });
  } catch (err) {
    console.error('[Auth deleteAccount] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete account.' });
  }
}

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  deleteAccount
};
