const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { ah } = require('../utils/helpers');

const strict = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { success: false, message: 'Too many attempts, try again later' } });

router.post('/register',        strict, ah(c.register));
router.post('/verify-register', strict, ah(c.verifyRegister));
router.post('/login',           strict, ah(c.login));
router.post('/verify-otp',      strict, ah(c.verifyOtp));
router.post('/resend-otp',      strict, ah(c.resendOtp));
router.post('/admin-login',     strict, ah(c.adminLogin));
router.get('/me',               protect, ah(c.getMe));
router.put('/me',               protect, ah(c.updateMe));
router.put('/change-password',  protect, ah(c.changePassword));
module.exports = router;
