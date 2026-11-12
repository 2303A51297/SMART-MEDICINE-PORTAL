const express = require('express');
const router = express.Router();
const {
  getAssignedDeliveries,
  updateDeliveryStatus,
  getAllDeliveries
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/assigned', protect, authorize('delivery'), getAssignedDeliveries);
router.put('/:id/status', protect, authorize('delivery', 'admin'), updateDeliveryStatus);
router.get('/', protect, authorize('admin', 'pharmacist'), getAllDeliveries);

module.exports = router;

