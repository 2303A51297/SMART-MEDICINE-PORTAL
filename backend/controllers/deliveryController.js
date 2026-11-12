const Delivery = require('../models/Delivery');
const Order = require('../models/Order');

// @desc    Get assigned deliveries for delivery partner
// @route   GET /api/deliveries/assigned
// @access  Private (Delivery)
const getAssignedDeliveries = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { deliveryPartner: req.user._id };

    if (status) {
      query.status = status;
    }

    const deliveries = await Delivery.find(query)
      .populate({
        path: 'order',
        populate: [
          { path: 'customer', select: 'name email phone' },
          { path: 'items.medicine', select: 'name genericName dosageForm' }
        ]
      })
      .sort({ assignedAt: -1 });

    res.json({
      success: true,
      count: deliveries.length,
      deliveries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery status
// @route   PUT /api/deliveries/:id/status
// @access  Private (Delivery / Admin)
const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { status, deliveryNotes, otp } = req.body;
    const validStatuses = ['assigned', 'picked_up', 'out_for_delivery', 'delivered', 'failed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid delivery status' });
    }

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery assignment not found' });
    }

    delivery.status = status;
    if (deliveryNotes) delivery.deliveryNotes = deliveryNotes;

    const now = new Date();
    if (status === 'picked_up') delivery.pickedUpAt = now;
    if (status === 'out_for_delivery') delivery.outForDeliveryAt = now;
    if (status === 'delivered') {
      delivery.deliveredAt = now;
      delivery.otpVerified = true;
    }

    await delivery.save();

    // Map to Order orderStatus
    const order = await Order.findById(delivery.order);
    if (order) {
      if (status === 'picked_up') {
        order.orderStatus = 'packed';
      } else if (status === 'out_for_delivery') {
        order.orderStatus = 'out_for_delivery';
      } else if (status === 'delivered') {
        order.orderStatus = 'delivered';
        order.deliveredAt = now;
        order.paymentStatus = 'completed';
      }

      order.timeline.push({
        status: status,
        note: `Delivery partner ${req.user.name} marked order as ${status.replace('_', ' ')}. ${deliveryNotes || ''}`,
        timestamp: now,
        updatedBy: req.user._id
      });

      await order.save();
    }

    const populated = await Delivery.findById(delivery._id)
      .populate('order')
      .populate('deliveryPartner', 'name phone');

    res.json({
      success: true,
      delivery: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all deliveries
// @route   GET /api/deliveries
// @access  Private (Admin / Pharmacist)
const getAllDeliveries = async (req, res, next) => {
  try {
    const deliveries = await Delivery.find()
      .populate('order', 'orderNumber totalAmount paymentStatus orderStatus')
      .populate('deliveryPartner', 'name phone email')
      .sort({ assignedAt: -1 });

    res.json({
      success: true,
      count: deliveries.length,
      deliveries
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssignedDeliveries,
  updateDeliveryStatus,
  getAllDeliveries
};

