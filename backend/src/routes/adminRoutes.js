const router = require('express').Router();
const a = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');
const { ah } = require('../utils/helpers');

router.use(protect, admin);
router.get('/dashboard', ah(a.getDashboard));
router.put('/change-credentials', ah(a.changeAdminCredentials));
router.get('/users', ah(a.getUsers));
router.get('/login-history', ah(a.getLoginHistory));
router.delete('/users/:id', ah(a.deleteUser));
router.put('/users/:id/block', ah(a.toggleBlockUser));
router.get('/orders', ah(a.getAdminOrders));
router.put('/orders/:id/status', ah(a.updateAdminOrderStatus));
router.delete('/orders/:id', ah(a.deleteAdminOrder));
router.get('/coupons', ah(a.getCoupons));
router.post('/coupons', ah(a.createCoupon));
router.delete('/coupons/:id', ah(a.deleteCoupon));
module.exports = router;
