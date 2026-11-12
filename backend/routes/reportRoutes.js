const express = require('express');
const router = express.Router();
const {
  getMedicineSalesReport,
  getMedicineStockReport,
  getExpiryTrackingReport,
  getCustomerOrderReport,
  exportReportCSV
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/sales', protect, authorize('admin', 'pharmacist'), getMedicineSalesReport);
router.get('/stock', protect, authorize('admin', 'pharmacist'), getMedicineStockReport);
router.get('/expiry', protect, authorize('admin', 'pharmacist'), getExpiryTrackingReport);
router.get('/customer-orders', protect, authorize('admin', 'pharmacist'), getCustomerOrderReport);
router.get('/export-csv', protect, authorize('admin', 'pharmacist'), exportReportCSV);

module.exports = router;

