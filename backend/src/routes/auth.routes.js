const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.put('/profile', verifyToken, authController.updateProfile);
router.post('/avatar', verifyToken, upload.single('avatar'), authController.uploadAvatar);
router.put('/change-password', verifyToken, authController.changePassword);
router.post('/logout', verifyToken, authController.logout);
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
