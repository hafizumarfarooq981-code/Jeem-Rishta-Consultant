const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');

// Public Auth Endpoints
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// Protected User Auth Endpoints
router.get('/me', authenticateUser, authController.getMe);
router.post('/change-password', authenticateUser, authController.changePassword);
router.delete('/delete-account', authenticateUser, authController.deleteAccount);

module.exports = router;
