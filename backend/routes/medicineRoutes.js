const express = require('express');
const router = express.Router();
const {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine
} = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getMedicines);
router.get('/:id', getMedicineById);
router.post('/', protect, authorize('pharmacist', 'admin'), createMedicine);
router.put('/:id', protect, authorize('pharmacist', 'admin'), updateMedicine);
router.delete('/:id', protect, authorize('admin'), deleteMedicine);

module.exports = router;

