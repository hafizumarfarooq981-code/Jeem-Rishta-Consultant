const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateUser } = require('../middleware/auth');
const { validateProfile } = require('../middleware/validate');

// Public Profile Endpoints (Strict privacy enforced - no private contact details returned)
router.get('/search', profileController.searchProfiles);
router.get('/:profileId/public', profileController.getPublicProfile);

// Authenticated User Profile Endpoints
router.post('/', authenticateUser, validateProfile, profileController.createProfile);
router.get('/user/my-profiles', authenticateUser, profileController.getMyProfiles);
router.get('/:profileId/user-full', authenticateUser, profileController.getUserProfileFull);
router.put('/:profileId', authenticateUser, validateProfile, profileController.updateProfile);
router.delete('/:profileId', authenticateUser, profileController.deleteProfile);

module.exports = router;
