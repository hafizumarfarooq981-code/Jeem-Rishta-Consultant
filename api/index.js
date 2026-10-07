const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Load seed data
const seedPath = path.resolve(__dirname, 'seedData.json');
let db = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

const JWT_SECRET = 'jeem_rishta_user_jwt_secret_key_2026_super_secure';
const ADMIN_JWT_SECRET = 'jeem_rishta_admin_jwt_secret_key_2026_super_secure';

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Health
const healthHandler = (req, res) => {
  res.json({
    success: true,
    status: 'ONLINE',
    app: 'Jeem Rishta Consultant',
    version: '1.0.0',
    profiles: db.rishta_profiles.length,
    users: db.users.length,
    timestamp: new Date().toISOString()
  });
};
app.get(['/api/health', '/health'], healthHandler);

// Settings
const publicSettingsHandler = (req, res) => {
  const settingsMap = {};
  db.admin_settings.forEach(s => settingsMap[s.setting_key] = s.setting_value);
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
};
app.get(['/api/settings/public', '/settings/public'], publicSettingsHandler);

// Profiles Search
const searchProfilesHandler = (req, res) => {
  try {
    const { gender, minAge, maxAge, religion, sect, city, marital_status, page = 1, limit = 12 } = req.query;
    let profiles = db.rishta_profiles.filter(p => p.status === 'active');

    if (gender) profiles = profiles.filter(p => p.gender.toLowerCase() === gender.toLowerCase());
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

    // Sanitize to only public safe attributes
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
};
app.get(['/api/profiles/search', '/profiles/search'], searchProfilesHandler);

// Single Profile Public Details
const profilePublicHandler = (req, res) => {
  const profileId = req.params.profileId;
  const profile = db.rishta_profiles.find(p => p.profile_id === profileId && p.status === 'active');
  if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });

  const family = db.profile_family_details.find(f => f.profile_id === profileId) || {};
  const partner = db.partner_requirements.find(p => p.profile_id === profileId) || {};

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
};
app.get(['/api/profiles/:profileId/public', '/profiles/:profileId/public'], profilePublicHandler);

// Admin Login
const adminLoginHandler = (req, res) => {
  const { username, password } = req.body;
  const admin = db.admin_users.find(a => a.username === username);
  if (!admin) return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });

  const valid = bcrypt.compareSync(password, admin.password_hash);
  if (!valid) return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });

  const token = jwt.sign({ id: admin.id, username: admin.username, role: admin.role }, ADMIN_JWT_SECRET, { expiresIn: '7d' });
  res.json({
    success: true,
    token,
    admin: { id: admin.id, username: admin.username, name: admin.name, role: admin.role }
  });
};
app.post(['/api/admin/login', '/admin/login'], adminLoginHandler);

// Admin Dashboard
app.get(['/api/admin/dashboard', '/admin/dashboard'], (req, res) => {
  const totalUsers = db.users.length;
  const totalProfiles = db.rishta_profiles.length;
  const maleProfiles = db.rishta_profiles.filter(p => p.gender === 'Male').length;
  const femaleProfiles = db.rishta_profiles.filter(p => p.gender === 'Female').length;
  const activeProfiles = db.rishta_profiles.filter(p => p.status === 'active').length;
  const blockedProfiles = db.rishta_profiles.filter(p => p.status === 'blocked').length;
  const removedProfiles = db.rishta_profiles.filter(p => p.status === 'removed').length;

  res.json({
    success: true,
    data: {
      stats: { totalUsers, totalProfiles, maleProfiles, femaleProfiles, activeProfiles, blockedProfiles, removedProfiles, newUsers: totalUsers, newProfiles: totalProfiles },
      recentActivity: db.audit_logs.slice(0, 10)
    }
  });
});

// Admin Profiles list
app.get(['/api/admin/profiles', '/admin/profiles'], (req, res) => {
  res.json({
    success: true,
    data: {
      profiles: db.rishta_profiles,
      pagination: { total: db.rishta_profiles.length, page: 1, limit: 100, totalPages: 1 }
    }
  });
});

// Admin Users list
app.get(['/api/admin/users', '/admin/users'], (req, res) => {
  res.json({
    success: true,
    data: {
      users: db.users.map(u => ({ id: u.id, mobile_number: u.mobile_number, status: u.status, created_at: u.created_at })),
      pagination: { total: db.users.length, page: 1, limit: 100, totalPages: 1 }
    }
  });
});

// Admin Settings
app.get(['/api/admin/settings', '/admin/settings'], (req, res) => {
  const settings = {};
  db.admin_settings.forEach(s => settings[s.setting_key] = s.setting_value);
  res.json({ success: true, settings });
});

// User Auth Login
app.post(['/api/auth/login', '/auth/login'], (req, res) => {
  const { mobile_number, password } = req.body;
  const user = db.users.find(u => u.mobile_number === mobile_number);
  if (!user) return res.status(401).json({ success: false, message: 'Invalid mobile number or password.' });

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return res.status(401).json({ success: false, message: 'Invalid mobile number or password.' });

  const token = jwt.sign({ id: user.id, mobile_number: user.mobile_number }, JWT_SECRET, { expiresIn: '30d' });
  res.json({
    success: true,
    token,
    user: { id: user.id, mobile_number: user.mobile_number }
  });
});

// User Auth Register
app.post(['/api/auth/register', '/auth/register'], (req, res) => {
  const { mobile_number, password } = req.body;
  if (!mobile_number || !password) return res.status(400).json({ success: false, message: 'Mobile and password required.' });

  const existing = db.users.find(u => u.mobile_number === mobile_number);
  if (existing) return res.status(409).json({ success: false, message: 'An account with this mobile number already exists.' });

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);
  const newUser = { id: db.users.length + 1, mobile_number, password_hash, status: 'active', created_at: new Date().toISOString() };
  db.users.push(newUser);

  const token = jwt.sign({ id: newUser.id, mobile_number: newUser.mobile_number }, JWT_SECRET, { expiresIn: '30d' });
  res.status(201).json({
    success: true,
    token,
    user: { id: newUser.id, mobile_number: newUser.mobile_number }
  });
});

// User Me
app.get(['/api/auth/me', '/auth/me'], (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: 'Not authenticated.' });
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.users.find(u => u.id === decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: { id: user.id, mobile_number: user.mobile_number, status: user.status } });
  } catch (e) {
    res.status(401).json({ success: false, message: 'Invalid or expired session.' });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.method} ${req.originalUrl} not found.` });
});

module.exports = app;
