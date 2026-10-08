import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load seed data into memory
const seedPath = path.resolve(__dirname, 'seedData.json');
let db = {
  admin_users: [],
  admin_settings: [],
  users: [],
  rishta_profiles: [],
  profile_family_details: [],
  partner_requirements: [],
  audit_logs: []
};

try {
  if (fs.existsSync(seedPath)) {
    const raw = fs.readFileSync(seedPath, 'utf8');
    db = JSON.parse(raw);
  }
} catch (e) {
  console.error('[API Init] Failed to load seedData.json:', e.message);
}

// Ensure superadmin exists
if (!db.admin_users || db.admin_users.length === 0) {
  const hash = bcrypt.hashSync('Admin@JeemRishta2026', 10);
  db.admin_users = [
    { id: 1, username: 'superadmin', password_hash: hash, name: 'Hafiz Umar Farooq', role: 'Super Admin', created_at: new Date().toISOString() }
  ];
}

const JWT_SECRET = 'jeem_rishta_user_jwt_secret_key_2026_super_secure';
const ADMIN_JWT_SECRET = 'jeem_rishta_admin_jwt_secret_key_2026_super_secure';

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Helper: Auth middleware for users
function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: 'Authorization header required.' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found.' });
    if (user.status === 'blocked') return res.status(403).json({ success: false, message: 'Account is suspended.' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session.' });
  }
}

// Helper: Auth middleware for admin
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: 'Admin authorization token required.' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    const admin = db.admin_users.find(a => a.id === decoded.id);
    if (!admin) return res.status(401).json({ success: false, message: 'Admin not found.' });
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin session.' });
  }
}

// 0. API Root
app.get(['/api', '/api/'], (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Jeem Rishta Consultant API is operational',
    status: 'ONLINE',
    version: '1.0.0',
    profiles: (db.rishta_profiles || []).length,
    users: (db.users || []).length,
    timestamp: new Date().toISOString()
  });
});

// 1. Health check
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ONLINE',
    app: 'Jeem Rishta Consultant',
    version: '1.0.0',
    profiles: (db.rishta_profiles || []).length,
    users: (db.users || []).length,
    timestamp: new Date().toISOString()
  });
});

// 2. Public Settings
app.get(['/api/settings/public', '/settings/public'], (req, res) => {
  const settingsMap = {};
  (db.admin_settings || []).forEach(s => settingsMap[s.setting_key] = s.setting_value);
  res.json({
    success: true,
    data: {
      admin_whatsapp_number: settingsMap.admin_whatsapp_number || '923414239981',
      app_name: settingsMap.app_name || 'Jeem Rishta Consultant',
      support_email: settingsMap.support_email || 'hafizumarfarooq981@gmail.com',
      support_phone: settingsMap.support_phone || '03414239981',
      terms_and_conditions: settingsMap.terms_and_conditions || '',
      privacy_policy: settingsMap.privacy_policy || ''
    }
  });
});

// 3. Profiles Search (Public)
app.get(['/api/profiles/search', '/profiles/search'], (req, res) => {
  try {
    const { gender, minAge, maxAge, religion, sect, city, marital_status, page = 1, limit = 12 } = req.query;
    let profiles = (db.rishta_profiles || []).filter(p => p.status === 'active');

    if (gender) profiles = profiles.filter(p => p.gender && p.gender.toLowerCase() === gender.toLowerCase());
    if (minAge) profiles = profiles.filter(p => p.age >= parseInt(minAge, 10));
    if (maxAge) profiles = profiles.filter(p => p.age <= parseInt(maxAge, 10));
    if (religion) profiles = profiles.filter(p => p.religion && p.religion.toLowerCase() === religion.toLowerCase());
    if (sect) profiles = profiles.filter(p => p.sect && p.sect.toLowerCase() === sect.toLowerCase());
    if (city) profiles = profiles.filter(p => p.city && p.city.toLowerCase().includes(city.toLowerCase()));
    if (marital_status) profiles = profiles.filter(p => p.marital_status && p.marital_status.toLowerCase() === marital_status.toLowerCase());

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const total = profiles.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const offset = (pageNum - 1) * limitNum;
    const pagedProfiles = profiles.slice(offset, offset + limitNum);

    const safeProfiles = pagedProfiles.map(p => ({
      profile_id: p.profile_id,
      gender: p.gender,
      age: p.age,
      marital_status: p.marital_status,
      religion: p.religion,
      sect: p.sect,
      education: p.education,
      custom_education: p.custom_education,
      profession: p.profession,
      city: p.city,
      relationship_for: p.relationship_for,
      created_at: p.created_at
    }));

    res.json({
      success: true,
      data: {
        profiles: safeProfiles,
        pagination: { total, page: pageNum, limit: limitNum, totalPages }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Single Profile Public Details
app.get(['/api/profiles/:profileId/public', '/profiles/:profileId/public'], (req, res) => {
  const profileId = req.params.profileId;
  const profile = (db.rishta_profiles || []).find(p => p.profile_id === profileId && p.status === 'active');
  if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });

  const family = (db.profile_family_details || []).find(f => f.profile_id === profileId) || {};
  const partner = (db.partner_requirements || []).find(p => p.profile_id === profileId) || {};

  res.json({
    success: true,
    data: {
      profile_id: profile.profile_id,
      relationship_for: profile.relationship_for,
      gender: profile.gender,
      age: profile.age,
      marital_status: profile.marital_status,
      religion: profile.religion,
      sect: profile.sect,
      education: profile.education,
      custom_education: profile.custom_education,
      profession: profile.profession,
      city: profile.city,
      created_at: profile.created_at,
      family: {
        brothers_count: family.brothers_count || 0,
        sisters_count: family.sisters_count || 0,
        married_brothers_count: family.married_brothers_count || 0,
        married_sisters_count: family.married_sisters_count || 0,
        family_background: family.family_background || ''
      },
      partner: {
        preferred_min_age: partner.preferred_min_age || 18,
        preferred_max_age: partner.preferred_max_age || 50,
        preferred_religion: partner.preferred_religion || 'Any',
        preferred_sect: partner.preferred_sect || 'Any',
        preferred_city: partner.preferred_city || 'Any',
        preferred_education: partner.preferred_education || 'Any',
        other_requirements: partner.other_requirements || ''
      }
    }
  });
});

// 5. User Auth: Register
app.post(['/api/auth/register', '/auth/register'], (req, res) => {
  const { mobile_number, password } = req.body || {};
  if (!mobile_number || !password) return res.status(400).json({ success: false, message: 'Mobile number and password required.' });

  const cleanMobile = mobile_number.trim();
  const existing = (db.users || []).find(u => u.mobile_number === cleanMobile);
  if (existing) return res.status(409).json({ success: false, message: 'An account with this mobile number already exists.' });

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);
  const newUser = {
    id: (db.users || []).length + 1,
    mobile_number: cleanMobile,
    password_hash,
    status: 'active',
    created_at: new Date().toISOString()
  };
  db.users.push(newUser);

  const token = jwt.sign({ id: newUser.id, mobile_number: newUser.mobile_number }, JWT_SECRET, { expiresIn: '30d' });
  res.status(201).json({
    success: true,
    token,
    user: { id: newUser.id, mobile_number: newUser.mobile_number, status: newUser.status }
  });
});

// 6. User Auth: Login
app.post(['/api/auth/login', '/auth/login'], (req, res) => {
  const { mobile_number, password } = req.body || {};
  if (!mobile_number || !password) return res.status(400).json({ success: false, message: 'Mobile and password required.' });

  const cleanMobile = mobile_number.trim();
  const user = (db.users || []).find(u => u.mobile_number === cleanMobile);
  if (!user) return res.status(401).json({ success: false, message: 'Invalid mobile number or password.' });
  if (user.status === 'blocked') return res.status(403).json({ success: false, message: 'Account is suspended.' });

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return res.status(401).json({ success: false, message: 'Invalid mobile number or password.' });

  const token = jwt.sign({ id: user.id, mobile_number: user.mobile_number }, JWT_SECRET, { expiresIn: '30d' });
  res.json({
    success: true,
    token,
    user: { id: user.id, mobile_number: user.mobile_number, status: user.status }
  });
});

// 7. User Auth: Me
app.get(['/api/auth/me', '/auth/me'], authenticateUser, (req, res) => {
  res.json({
    success: true,
    user: { id: req.user.id, mobile_number: req.user.mobile_number, status: req.user.status }
  });
});

// 8. User Auth: Change Password
app.post(['/api/auth/change-password', '/auth/change-password'], authenticateUser, (req, res) => {
  const { old_password, new_password } = req.body || {};
  if (!old_password || !new_password) return res.status(400).json({ success: false, message: 'Both passwords required.' });

  const valid = bcrypt.compareSync(old_password, req.user.password_hash);
  if (!valid) return res.status(401).json({ success: false, message: 'Incorrect current password.' });

  req.user.password_hash = bcrypt.hashSync(new_password, 10);
  res.json({ success: true, message: 'Password updated successfully.' });
});

// 9. User Auth: Delete Account
app.delete(['/api/auth/delete-account', '/auth/delete-account'], authenticateUser, (req, res) => {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ success: false, message: 'Password confirmation required.' });

  const valid = bcrypt.compareSync(password, req.user.password_hash);
  if (!valid) return res.status(401).json({ success: false, message: 'Incorrect password.' });

  db.users = db.users.filter(u => u.id !== req.user.id);
  db.rishta_profiles = db.rishta_profiles.filter(p => p.user_id !== req.user.id);
  res.json({ success: true, message: 'Account deleted.' });
});

// 10. User: Create Profile (Add Rishta)
app.post(['/api/profiles', '/profiles'], authenticateUser, (req, res) => {
  try {
    const data = req.body || {};
    const nextNum = 1000 + (db.rishta_profiles || []).length + 1;
    const profile_id = `JR-${nextNum}`;

    const newProfile = {
      profile_id,
      user_id: req.user.id,
      gender: data.gender || 'Male',
      age: parseInt(data.age, 10) || 25,
      marital_status: data.marital_status || 'Single',
      religion: data.religion || 'Islam',
      sect: data.sect || 'Sunni',
      caste: data.caste || '',
      height_feet: data.height_feet || 5,
      height_inches: data.height_inches || 8,
      complexion: data.complexion || 'Fair',
      education: data.education || 'Bachelors',
      custom_education: data.custom_education || '',
      profession: data.profession || 'Job',
      job_title: data.job_title || '',
      monthly_income: data.monthly_income || '',
      city: data.city || 'Lahore',
      relationship_for: data.relationship_for || 'Self',
      contact_mobile: data.contact_mobile || req.user.mobile_number,
      guardian_name: data.guardian_name || '',
      guardian_relation: data.guardian_relation || '',
      additional_notes: data.additional_notes || '',
      status: 'active',
      created_at: new Date().toISOString()
    };
    db.rishta_profiles.push(newProfile);

    // Family details
    if (data.family) {
      db.profile_family_details.push({
        profile_id,
        brothers_count: parseInt(data.family.brothers_count, 10) || 0,
        sisters_count: parseInt(data.family.sisters_count, 10) || 0,
        married_brothers_count: parseInt(data.family.married_brothers_count, 10) || 0,
        married_sisters_count: parseInt(data.family.married_sisters_count, 10) || 0,
        father_occupation: data.family.father_occupation || '',
        mother_occupation: data.family.mother_occupation || '',
        family_background: data.family.family_background || '',
        created_at: new Date().toISOString()
      });
    }

    // Partner requirements
    if (data.partner) {
      db.partner_requirements.push({
        profile_id,
        preferred_min_age: parseInt(data.partner.preferred_min_age, 10) || 18,
        preferred_max_age: parseInt(data.partner.preferred_max_age, 10) || 45,
        preferred_religion: data.partner.preferred_religion || 'Islam',
        preferred_sect: data.partner.preferred_sect || 'Any',
        preferred_city: data.partner.preferred_city || 'Any',
        preferred_education: data.partner.preferred_education || 'Any',
        other_requirements: data.partner.other_requirements || '',
        created_at: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Profile submitted successfully.',
      data: { profile_id }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 11. User: My Profiles
app.get(['/api/profiles/user/my-profiles', '/profiles/user/my-profiles'], authenticateUser, (req, res) => {
  const myProfiles = (db.rishta_profiles || []).filter(p => p.user_id === req.user.id);
  res.json({ success: true, data: myProfiles });
});

// 12. User: Get Profile Full
app.get(['/api/profiles/:profileId/user-full', '/profiles/:profileId/user-full'], authenticateUser, (req, res) => {
  const profileId = req.params.profileId;
  const profile = (db.rishta_profiles || []).find(p => p.profile_id === profileId && p.user_id === req.user.id);
  if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });

  const family = (db.profile_family_details || []).find(f => f.profile_id === profileId) || {};
  const partner = (db.partner_requirements || []).find(p => p.profile_id === profileId) || {};

  res.json({
    success: true,
    data: { ...profile, family, partner }
  });
});

// 13. User: Update Profile
app.put(['/api/profiles/:profileId', '/profiles/:profileId'], authenticateUser, (req, res) => {
  const profileId = req.params.profileId;
  const profile = (db.rishta_profiles || []).find(p => p.profile_id === profileId && p.user_id === req.user.id);
  if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });

  Object.assign(profile, req.body);
  res.json({ success: true, message: 'Profile updated.' });
});

// 14. User: Delete Profile
app.delete(['/api/profiles/:profileId', '/profiles/:profileId'], authenticateUser, (req, res) => {
  const profileId = req.params.profileId;
  db.rishta_profiles = (db.rishta_profiles || []).filter(p => !(p.profile_id === profileId && p.user_id === req.user.id));
  res.json({ success: true, message: 'Profile deleted.' });
});

// 15. Admin: Login
app.post(['/api/admin/login', '/admin/login'], (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ success: false, message: 'Username and password required.' });

  const admin = (db.admin_users || []).find(a => a.username === username);
  if (!admin) return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });

  const valid = bcrypt.compareSync(password, admin.password_hash);
  if (!valid) return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });

  const token = jwt.sign({ id: admin.id, username: admin.username, role: admin.role }, ADMIN_JWT_SECRET, { expiresIn: '7d' });
  res.json({
    success: true,
    token,
    admin: { id: admin.id, username: admin.username, name: admin.name, role: admin.role }
  });
});

// 16. Admin: Dashboard
app.get(['/api/admin/dashboard', '/admin/dashboard'], authenticateAdmin, (req, res) => {
  const totalUsers = (db.users || []).length;
  const totalProfiles = (db.rishta_profiles || []).length;
  const maleProfiles = (db.rishta_profiles || []).filter(p => p.gender === 'Male').length;
  const femaleProfiles = (db.rishta_profiles || []).filter(p => p.gender === 'Female').length;
  const activeProfiles = (db.rishta_profiles || []).filter(p => p.status === 'active').length;
  const blockedProfiles = (db.rishta_profiles || []).filter(p => p.status === 'blocked').length;
  const removedProfiles = (db.rishta_profiles || []).filter(p => p.status === 'removed').length;

  res.json({
    success: true,
    data: {
      stats: { totalUsers, totalProfiles, maleProfiles, femaleProfiles, activeProfiles, blockedProfiles, removedProfiles, newUsers: totalUsers, newProfiles: totalProfiles },
      recentActivity: (db.audit_logs || []).slice(0, 10)
    }
  });
});

// 17. Admin: Users List
app.get(['/api/admin/users', '/admin/users'], authenticateAdmin, (req, res) => {
  const users = (db.users || []).map(u => ({
    id: u.id,
    mobile_number: u.mobile_number,
    status: u.status,
    created_at: u.created_at,
    profiles_count: (db.rishta_profiles || []).filter(p => p.user_id === u.id).length
  }));
  res.json({
    success: true,
    data: {
      users,
      pagination: { total: users.length, page: 1, limit: 100, totalPages: 1 }
    }
  });
});

// 18. Admin: Set User Status
app.post(['/api/admin/users/:userId/status', '/admin/users/:userId/status'], authenticateAdmin, (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const user = (db.users || []).find(u => u.id === userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  user.status = req.body.status || 'active';
  res.json({ success: true, message: 'User status updated.', user });
});

// 19. Admin: Delete User
app.delete(['/api/admin/users/:userId', '/admin/users/:userId'], authenticateAdmin, (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  db.users = (db.users || []).filter(u => u.id !== userId);
  db.rishta_profiles = (db.rishta_profiles || []).filter(p => p.user_id !== userId);
  res.json({ success: true, message: 'User deleted.' });
});

// 20. Admin: User Profiles
app.get(['/api/admin/users/:userId/profiles', '/admin/users/:userId/profiles'], authenticateAdmin, (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const profiles = (db.rishta_profiles || []).filter(p => p.user_id === userId);
  res.json({ success: true, data: { profiles } });
});

// 21. Admin: Profiles List
app.get(['/api/admin/profiles', '/admin/profiles'], authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    data: {
      profiles: db.rishta_profiles || [],
      pagination: { total: (db.rishta_profiles || []).length, page: 1, limit: 100, totalPages: 1 }
    }
  });
});

// 22. Admin: Single Profile Details
app.get(['/api/admin/profiles/:profileId', '/admin/profiles/:profileId'], authenticateAdmin, (req, res) => {
  const profileId = req.params.profileId;
  const profile = (db.rishta_profiles || []).find(p => p.profile_id === profileId);
  if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });

  const family = (db.profile_family_details || []).find(f => f.profile_id === profileId) || {};
  const partner = (db.partner_requirements || []).find(p => p.profile_id === profileId) || {};

  res.json({
    success: true,
    data: { ...profile, family, partner }
  });
});

// 23. Admin: Set Profile Status
app.post(['/api/admin/profiles/:profileId/status', '/admin/profiles/:profileId/status'], authenticateAdmin, (req, res) => {
  const profileId = req.params.profileId;
  const profile = (db.rishta_profiles || []).find(p => p.profile_id === profileId);
  if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });

  profile.status = req.body.status || 'active';
  res.json({ success: true, message: 'Profile status updated.', profile });
});

// 24. Admin: Get Settings
app.get(['/api/admin/settings', '/admin/settings'], authenticateAdmin, (req, res) => {
  const settings = {};
  (db.admin_settings || []).forEach(s => settings[s.setting_key] = s.setting_value);
  res.json({ success: true, settings });
});

// 25. Admin: Update Settings
app.put(['/api/admin/settings', '/admin/settings'], authenticateAdmin, (req, res) => {
  const newSettings = req.body.settings || req.body || {};
  Object.entries(newSettings).forEach(([k, v]) => {
    const existing = (db.admin_settings || []).find(s => s.setting_key === k);
    if (existing) {
      existing.setting_value = String(v);
    } else {
      (db.admin_settings = db.admin_settings || []).push({
        setting_key: k,
        setting_value: String(v),
        setting_type: 'string',
        is_public: 1
      });
    }
  });
  res.json({ success: true, message: 'Settings saved.' });
});

// 26. Admin: Audit Logs
app.get(['/api/admin/audit-logs', '/admin/audit-logs'], authenticateAdmin, (req, res) => {
  res.json({ success: true, data: { logs: db.audit_logs || [] } });
});

// Fallback 404 for unhandled API requests
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.method} ${req.originalUrl} not found.` });
});

// Vercel Serverless Function entry point with smart subpath reconstruction
export default function handler(req, res) {
  let subpath = null;
  if (req.query && req.query.__subpath) {
    subpath = req.query.__subpath;
    delete req.query.__subpath;
  } else if (req.headers && req.headers['x-matched-path']) {
    const matched = req.headers['x-matched-path'];
    if (matched.startsWith('/api/') && matched !== '/api') {
      subpath = matched.slice(5);
    }
  }

  if (subpath) {
    if (!subpath.startsWith('/')) subpath = '/' + subpath;
    const qKeys = req.query ? Object.keys(req.query) : [];
    const qs = qKeys.length > 0 ? '?' + new URLSearchParams(req.query).toString() : '';
    req.url = '/api' + subpath + qs;
  }

  return app(req, res);
}

