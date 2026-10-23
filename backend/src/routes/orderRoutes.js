const router = require('express').Router();
const c = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { ah } = require('../utils/helpers');

router.post('/', protect, ah(c.createOrder));
router.get('/my', protect, ah(c.getMyOrders));
router.post('/:id/cancel', protect, ah(c.cancelMyOrder));
router.get('/:id', protect, ah(c.getOrder));
module.exports = router;
