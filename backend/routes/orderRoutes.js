const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('customer'), createOrder);
router.get('/my', protect, authorize('customer'), getMyOrders);
router.get('/', protect, authorize('pharmacist', 'admin'), getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, authorize('pharmacist', 'admin', 'delivery'), updateOrderStatus);

module.exports = router;

