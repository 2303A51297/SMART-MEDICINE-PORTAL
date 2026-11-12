const express = require('express');
const router = express.Router();
const {
  processSimulatedPayment,
  getPaymentByOrder
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/process', protect, processSimulatedPayment);
router.get('/order/:orderId', protect, getPaymentByOrder);

module.exports = router;

