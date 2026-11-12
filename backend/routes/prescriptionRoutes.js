const express = require('express');
const router = express.Router();
const {
  uploadPrescription,
  getMyPrescriptions,
  getAllPrescriptions,
  reviewPrescription
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, authorize('customer'), upload.single('prescriptionFile'), uploadPrescription);
router.get('/my', protect, authorize('customer'), getMyPrescriptions);
router.get('/', protect, authorize('pharmacist', 'admin'), getAllPrescriptions);
router.put('/:id/review', protect, authorize('pharmacist', 'admin'), reviewPrescription);

module.exports = router;

