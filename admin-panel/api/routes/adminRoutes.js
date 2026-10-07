const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const settingsController = require('../controllers/settingsController');
const { authenticateAdmin } = require('../middleware/adminAuth');

// Public Admin Login
router.post('/login', adminController.loginAdmin);

// Protected Admin Endpoints
router.use(authenticateAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Users Management
router.get('/users', adminController.getUsers);
router.post('/users/:userId/status', adminController.setUserStatus);
router.delete('/users/:userId', adminController.deleteUser);
router.get('/users/:userId/profiles', adminController.getUserProfiles);

// Profiles Management
router.get('/profiles', adminController.getProfiles);
router.get('/profiles/:profileId', adminController.getProfileFullAdmin);
router.post('/profiles/:profileId/status', adminController.setProfileStatus);

// Settings
router.get('/settings', settingsController.getAdminSettings);
router.put('/settings', settingsController.updateAdminSettings);

// Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
