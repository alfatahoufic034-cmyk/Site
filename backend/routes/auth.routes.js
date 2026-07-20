const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const { checkIpBlock } = require('../middleware/ip_block.middleware');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({ windowMs: 15*60*1000, max: 6, message: { error: 'Too many login attempts, try again later' } });

router.post('/register', checkIpBlock, registerValidator, authController.register);
router.post('/login', checkIpBlock, loginLimiter, loginValidator, authController.login);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/logout', authController.logout);
router.get('/me', require('../middleware/auth.middleware').authenticate, authController.me);

module.exports = router;