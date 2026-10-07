const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../database/db');
const { comparePassword } = require('../utils/password');
const { logAdminActivity } = require('../utils/auditLogger');

function loginAdmin(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const admin = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const match = comparePassword(password, admin.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role, name: admin.name },
      config.adminJwtSecret,
      { expiresIn: '7d' }
    );

    logAdminActivity(admin.id, 'ADMIN_LOGIN', 'auth', admin.username, 'Admin logged in to dashboard');

    return res.json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('[Admin loginAdmin] Error:', err);
    return res.status(500).json({ success: false, message: 'Login failed.' });
  }
}

function getDashboardStats(req, res) {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalProfiles = db.prepare('SELECT COUNT(*) as count FROM rishta_profiles').get().count;
    const maleProfiles = db.prepare("SELECT COUNT(*) as count FROM rishta_profiles WHERE gender = 'Male'").get().count;
    const femaleProfiles = db.prepare("SELECT COUNT(*) as count FROM rishta_profiles WHERE gender = 'Female'").get().count;
    const activeProfiles = db.prepare("SELECT COUNT(*) as count FROM rishta_profiles WHERE status = 'active'").get().count;
    const blockedProfiles = db.prepare("SELECT COUNT(*) as count FROM rishta_profiles WHERE status = 'blocked'").get().count;
    const removedProfiles = db.prepare("SELECT COUNT(*) as count FROM rishta_profiles WHERE status = 'removed'").get().count;

    const newUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-7 days')").get().count;
    const newProfiles = db.prepare("SELECT COUNT(*) as count FROM rishta_profiles WHERE created_at >= datetime('now', '-7 days')").get().count;

    const recentActivity = db.prepare(`
      SELECT 
        l.id, l.action, l.target_type, l.target_id, l.details, l.created_at,
        a.name as admin_name, a.username as admin_username
      FROM audit_logs l
      LEFT JOIN admin_users a ON l.admin_id = a.id
      ORDER BY l.id DESC
      LIMIT 10
    `).all();

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalProfiles,
        maleProfiles,
        femaleProfiles,
        activeProfiles,
        blockedProfiles,
        removedProfiles,
        newUsers,
        newProfiles
      },
      recentActivity
    });
  } catch (err) {
    console.error('[Admin getDashboardStats] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard metrics.' });
  }
}

function getUsers(req, res) {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      conditions.push('(u.mobile_number LIKE ? OR u.id = ?)');
      params.push(`%${search.trim()}%`, search.trim());
    }

    if (status && status.trim()) {
      conditions.push('u.status = ?');
      params.push(status.trim());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = db.prepare(`SELECT COUNT(*) as total FROM users u ${whereClause}`).get(...params);
    const total = countRow ? countRow.total : 0;

    const users = db.prepare(`
      SELECT 
        u.id,
        u.mobile_number,
        u.status,
        u.created_at,
        u.last_login_at,
        (SELECT COUNT(*) FROM rishta_profiles WHERE user_id = u.id) as profile_count
      FROM users u
      ${whereClause}
      ORDER BY u.id DESC
      LIMIT ? OFFSET ?
    `).all(...params, limitNum, offset);

    return res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1
        }
      }
    });
  } catch (err) {
    console.error('[Admin getUsers] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
}

function setUserStatus(req, res) {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const user = db.prepare('SELECT id, mobile_number FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    db.prepare("UPDATE users SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, userId);

    logAdminActivity(
      req.admin.id,
      status === 'blocked' ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
      'user',
      user.id,
      `User ${user.mobile_number} set to ${status}`
    );

    return res.json({
      success: true,
      message: `User status changed to ${status}.`
    });
  } catch (err) {
    console.error('[Admin setUserStatus] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
}

function deleteUser(req, res) {
  try {
    const { userId } = req.params;
    const user = db.prepare('SELECT id, mobile_number FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    logAdminActivity(req.admin.id, 'USER_DELETED', 'user', userId, `User ${user.mobile_number} permanently deleted`);

    return res.json({
      success: true,
      message: 'User and all associated profiles deleted permanently.'
    });
  } catch (err) {
    console.error('[Admin deleteUser] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
}

function getUserProfiles(req, res) {
  try {
    const { userId } = req.params;
    const profiles = db.prepare(`
      SELECT * FROM rishta_profiles WHERE user_id = ? ORDER BY id DESC
    `).all(userId);

    return res.json({
      success: true,
      profiles
    });
  } catch (err) {
    console.error('[Admin getUserProfiles] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch user profiles.' });
  }
}

function getProfiles(req, res) {
  try {
    const {
      profileId,
      gender,
      religion,
      sect,
      marital_status,
      city,
      status,
      page = 1,
      limit = 20
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (profileId && profileId.trim()) {
      conditions.push('p.profile_id LIKE ?');
      params.push(`%${profileId.trim()}%`);
    }

    if (gender && gender.trim()) {
      conditions.push('p.gender = ?');
      params.push(gender.trim());
    }

    if (religion && religion.trim()) {
      conditions.push('p.religion = ?');
      params.push(religion.trim());
    }

    if (sect && sect.trim()) {
      conditions.push('p.sect = ?');
      params.push(sect.trim());
    }

    if (marital_status && marital_status.trim()) {
      conditions.push('p.marital_status = ?');
      params.push(marital_status.trim());
    }

    if (city && city.trim()) {
      conditions.push('LOWER(p.city) LIKE LOWER(?)');
      params.push(`%${city.trim()}%`);
    }

    if (status && status.trim()) {
      conditions.push('p.status = ?');
      params.push(status.trim());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = db.prepare(`SELECT COUNT(*) as total FROM rishta_profiles p ${whereClause}`).get(...params);
    const total = countRow ? countRow.total : 0;

    const profiles = db.prepare(`
      SELECT 
        p.*,
        u.mobile_number as user_mobile
      FROM rishta_profiles p
      JOIN users u ON p.user_id = u.id
      ${whereClause}
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `).all(...params, limitNum, offset);

    return res.json({
      success: true,
      data: {
        profiles,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1
        }
      }
    });
  } catch (err) {
    console.error('[Admin getProfiles] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch profiles.' });
  }
}

/**
 * Get Full Profile including PRIVATE details for authorized Admin view
 */
function getProfileFullAdmin(req, res) {
  try {
    const { profileId } = req.params;

    const profile = db.prepare(`
      SELECT p.*, u.mobile_number as user_account_mobile, u.status as user_account_status
      FROM rishta_profiles p
      JOIN users u ON p.user_id = u.id
      WHERE p.profile_id = ?
    `).get(profileId);

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    const family = db.prepare('SELECT * FROM profile_family_details WHERE profile_id = ?').get(profileId) || {};
    // PRIVATE DETAILS ACCESSIBLE ONLY TO ADMIN:
    const privateDetails = db.prepare('SELECT * FROM profile_private_details WHERE profile_id = ?').get(profileId) || {};
    const partner = db.prepare('SELECT * FROM partner_requirements WHERE profile_id = ?').get(profileId) || {};

    return res.json({
      success: true,
      data: {
        profile,
        family,
        private_details: privateDetails,
        partner_requirements: partner
      }
    });
  } catch (err) {
    console.error('[Admin getProfileFullAdmin] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load full profile.' });
  }
}

function setProfileStatus(req, res) {
  try {
    const { profileId } = req.params;
    const { status } = req.body;

    if (!['active', 'blocked', 'removed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid profile status.' });
    }

    const profile = db.prepare('SELECT id, profile_id FROM rishta_profiles WHERE profile_id = ?').get(profileId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    db.prepare("UPDATE rishta_profiles SET status = ?, updated_at = datetime('now') WHERE profile_id = ?").run(status, profileId);

    let action = 'PROFILE_UPDATED';
    if (status === 'blocked') action = 'PROFILE_BLOCKED';
    if (status === 'active') action = 'PROFILE_UNBLOCKED';
    if (status === 'removed') action = 'PROFILE_REMOVED';

    logAdminActivity(req.admin.id, action, 'profile', profileId, `Profile ${profileId} status changed to ${status}`);

    return res.json({
      success: true,
      message: `Profile ${profileId} status changed to ${status}.`
    });
  } catch (err) {
    console.error('[Admin setProfileStatus] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile status.' });
  }
}

function getAuditLogs(req, res) {
  try {
    const { page = 1, limit = 30 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));
    const offset = (pageNum - 1) * limitNum;

    const countRow = db.prepare('SELECT COUNT(*) as total FROM audit_logs').get();
    const total = countRow ? countRow.total : 0;

    const logs = db.prepare(`
      SELECT 
        l.id, l.action, l.target_type, l.target_id, l.details, l.created_at,
        a.name as admin_name, a.username as admin_username
      FROM audit_logs l
      LEFT JOIN admin_users a ON l.admin_id = a.id
      ORDER BY l.id DESC
      LIMIT ? OFFSET ?
    `).all(limitNum, offset);

    return res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1
        }
      }
    });
  } catch (err) {
    console.error('[Admin getAuditLogs] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
  }
}

module.exports = {
  loginAdmin,
  getDashboardStats,
  getUsers,
  setUserStatus,
  deleteUser,
  getUserProfiles,
  getProfiles,
  getProfileFullAdmin,
  setProfileStatus,
  getAuditLogs
};
