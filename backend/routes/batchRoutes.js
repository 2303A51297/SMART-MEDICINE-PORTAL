const express = require('express');
const router = express.Router();
const {
  getBatchesByMedicine,
  getAllBatches,
  createBatch,
  updateBatch,
  getExpiringSummary
} = require('../controllers/batchController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('pharmacist', 'admin'), getAllBatches);
router.get('/expiring-summary', protect, authorize('pharmacist', 'admin'), getExpiringSummary);
router.get('/medicine/:medicineId', protect, authorize('pharmacist', 'admin'), getBatchesByMedicine);
router.post('/', protect, authorize('pharmacist', 'admin'), createBatch);
router.put('/:id', protect, authorize('pharmacist', 'admin'), updateBatch);

module.exports = router;

