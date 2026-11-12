const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUser,
  getDeliveryPartners,
  getAdminStats
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', protect, authorize('admin'), getAdminStats);
router.get('/delivery-partners', protect, authorize('admin', 'pharmacist'), getDeliveryPartners);
router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:id', protect, authorize('admin'), updateUser);

module.exports = router;

