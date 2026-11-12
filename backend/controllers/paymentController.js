const Payment = require('../models/Payment');
const Order = require('../models/Order');

// @desc    Process simulated payment gateway transaction
// @route   POST /api/payments/process
// @access  Private (Customer)
const processSimulatedPayment = async (req, res, next) => {
  try {
    const { orderId, paymentMethod, cardNumber, upiId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied to this order' });
    }

    if (order.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Order is already paid' });
    }

    const transactionId = `TXN-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const authCode = `AUTH-SBX-${Math.floor(100000 + Math.random() * 900000)}`;

    const payment = await Payment.create({
      order: order._id,
      customer: req.user._id,
      amount: order.totalAmount,
      currency: 'INR',
      paymentMethod: paymentMethod || 'card',
      transactionId,
      status: 'success',
      gatewayResponse: {
        simulatedCardLast4: cardNumber ? cardNumber.slice(-4) : '4242',
        simulatedUpiId: upiId || 'testuser@okhdfcbank',
        authCode,
        message: 'Sandbox transaction authorized and settled successfully'
      },
      paymentDate: new Date()
    });

    order.paymentStatus = 'completed';
    order.paymentMethod = paymentMethod || order.paymentMethod;
    order.timeline.push({
      status: 'payment_verified',
      note: `Payment of ₹${order.totalAmount} verified via ${paymentMethod || 'card'} (Ref: ${transactionId})`,
      timestamp: new Date(),
      updatedBy: req.user._id
    });
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      payment,
      orderStatus: order.orderStatus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment receipt for order
// @route   GET /api/payments/order/:orderId
// @access  Private
const getPaymentByOrder = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId })
      .populate('order', 'orderNumber totalAmount paymentStatus')
      .populate('customer', 'name email phone');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'No payment record found for this order' });
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { processSimulatedPayment, getPaymentByOrder };

