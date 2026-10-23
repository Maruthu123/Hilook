const router = require('express').Router();
const c = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const { ah } = require('../utils/helpers');

router.get('/', ah(c.getProducts));
router.get('/:id', ah(c.getProduct));
router.post('/', protect, admin, ah(c.createProduct));
router.put('/:id', protect, admin, ah(c.updateProduct));
router.delete('/:id', protect, admin, ah(c.deleteProduct));
router.patch('/:id/availability', protect, admin, ah(c.toggleAvailability));
router.post('/:id/review', protect, ah(c.addReview));
module.exports = router;
