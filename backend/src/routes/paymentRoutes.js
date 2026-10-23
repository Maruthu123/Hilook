const router = require('express').Router();
const c = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { ah } = require('../utils/helpers');

router.get('/config', c.config);
router.post('/create-order', protect, ah(c.createRazorpayOrder));
router.post('/verify', protect, ah(c.verifyPayment));
module.exports = router;
