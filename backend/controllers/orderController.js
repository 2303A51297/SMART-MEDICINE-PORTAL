const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const MedicineBatch = require('../models/MedicineBatch');
const Delivery = require('../models/Delivery');
const User = require('../models/User');

// Helper to generate unique order number
const generateOrderNumber = () => {
  const prefix = 'MED';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}-${random}`;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
const createOrder = async (req, res, next) => {
  try {
    const { items, prescription, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items provided' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.phone) {
      return res.status(400).json({ success: false, message: 'Complete delivery address and contact phone are required' });
    }

    const processedItems = [];
    let subtotal = 0;

    // Verify stock and allocate batches (FIFO: earliest expiry first)
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId || item.medicine);
      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: `Medicine with ID ${item.medicineId || item.medicine} not found`
        });
      }

      if (medicine.prescriptionRequired && !prescription) {
        return res.status(400).json({
          success: false,
          message: `Medicine '${medicine.name}' requires a verified doctor prescription`
        });
      }

      const qtyNeeded = parseInt(item.quantity) || 1;
      if (medicine.totalStock < qtyNeeded) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${medicine.name}'. Available: ${medicine.totalStock}, Requested: ${qtyNeeded}`
        });
      }

      // Find active batches with available stock sorted by expiryDate ascending (FEFO: First Expired, First Out)
      const batches = await MedicineBatch.find({
        medicine: medicine._id,
        status: 'active',
        remainingQuantity: { $gt: 0 },
        expiryDate: { $gt: new Date() }
      }).sort({ expiryDate: 1 });

      let remainingToDeduct = qtyNeeded;
      let primaryBatch = null;

      for (const b of batches) {
        if (remainingToDeduct <= 0) break;
        if (!primaryBatch) primaryBatch = b._id;

        const deduct = Math.min(b.remainingQuantity, remainingToDeduct);
        b.remainingQuantity -= deduct;
        if (b.remainingQuantity === 0) {
          b.status = 'exhausted';
        }
        await b.save();
        remainingToDeduct -= deduct;
      }

      // Deduct from medicine cached totalStock
      medicine.totalStock -= qtyNeeded;
      await medicine.save();

      const itemPrice = medicine.price;
      const itemSubtotal = itemPrice * qtyNeeded;
      subtotal += itemSubtotal;

      processedItems.push({
        medicine: medicine._id,
        batch: primaryBatch,
        name: medicine.name,
        price: itemPrice,
        quantity: qtyNeeded,
        subtotal: itemSubtotal
      });
    }

    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
    const deliveryFee = subtotal > 500 ? 0 : 40;
    const totalAmount = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      prescription: prescription || null,
      items: processedItems,
      subtotal,
      tax,
      deliveryFee,
      totalAmount,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      orderStatus: 'placed',
      shippingAddress,
      timeline: [
        {
          status: 'placed',
          note: 'Order successfully placed by customer',
          timestamp: new Date(),
          updatedBy: req.user._id
        }
      ],
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
    });

    // Auto-create delivery record with default delivery partner
    const deliveryDriver = await User.findOne({ role: 'delivery', isActive: true });
    if (deliveryDriver) {
      order.deliveryPartner = deliveryDriver._id;
      await order.save();

      await Delivery.create({
        order: order._id,
        deliveryPartner: deliveryDriver._id,
        status: 'assigned',
        customerName: req.user.name,
        deliveryAddress: shippingAddress,
        deliveryNotes: 'Standard priority pharmacy order delivery'
      });
    }

    const populated = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('items.medicine', 'name genericName brand image')
      .populate('deliveryPartner', 'name phone');

    res.status(201).json({
      success: true,
      order: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in customer orders
// @route   GET /api/orders/my
// @access  Private (Customer)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('items.medicine', 'name genericName image')
      .populate('deliveryPartner', 'name phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders with filter
// @route   GET /api/orders
// @access  Private (Pharmacist / Admin)
const getAllOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, search } = req.query;
    const query = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.orderNumber = { $regex: search, $options: 'i' };
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('deliveryPartner', 'name phone')
      .populate('items.medicine', 'name genericName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private (Any authenticated role with access)
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('prescription')
      .populate('items.medicine', 'name genericName brand image price')
      .populate('deliveryPartner', 'name phone')
      .populate('timeline.updatedBy', 'name role');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Role check: customer can only view their own order
    if (
      req.user.role === 'customer' &&
      order.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Fetch delivery info
    const delivery = await Delivery.findOne({ order: order._id }).populate('deliveryPartner', 'name phone');

    res.json({
      success: true,
      order,
      delivery
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Pharmacist / Admin / Delivery)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, deliveryPartnerId } = req.body;
    const validStatuses = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = status;

    if (deliveryPartnerId) {
      order.deliveryPartner = deliveryPartnerId;
    }

    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'completed';
    }

    // Handle cancellation: restore inventory!
    if (status === 'cancelled' && order.orderStatus !== 'cancelled') {
      for (const item of order.items) {
        await Medicine.findByIdAndUpdate(item.medicine, {
          $inc: { totalStock: item.quantity }
        });
        if (item.batch) {
          await MedicineBatch.findByIdAndUpdate(item.batch, {
            $inc: { remainingQuantity: item.quantity },
            status: 'active'
          });
        }
      }
    }

    order.timeline.push({
      status,
      note: note || `Order status updated to ${status.replace('_', ' ')}`,
      timestamp: new Date(),
      updatedBy: req.user._id
    });

    await order.save();

    // Synchronize delivery record status
    const deliveryStatusMap = {
      packed: 'assigned',
      out_for_delivery: 'out_for_delivery',
      delivered: 'delivered'
    };

    if (deliveryStatusMap[status]) {
      const delivery = await Delivery.findOne({ order: order._id });
      if (delivery) {
        delivery.status = deliveryStatusMap[status];
        if (status === 'out_for_delivery') delivery.outForDeliveryAt = new Date();
        if (status === 'delivered') delivery.deliveredAt = new Date();
        await delivery.save();
      }
    }

    const populated = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('deliveryPartner', 'name phone')
      .populate('items.medicine', 'name genericName');

    res.json({
      success: true,
      order: populated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus
};

