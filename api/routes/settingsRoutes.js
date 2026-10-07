const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// Public Settings Route (returns dynamic WhatsApp number, app name, etc.)
router.get('/public', settingsController.getPublicSettings);

module.exports = router;
