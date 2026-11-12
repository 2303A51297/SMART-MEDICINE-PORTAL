const User = require('../models/User');
const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const Prescription = require('../models/Prescription');

// @desc    Get all users with role filtering
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role or active status
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
  try {
    const { role, isActive, name, phone } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get delivery partners list
// @route   GET /api/users/delivery-partners
// @access  Private (Admin / Pharmacist)
const getDeliveryPartners = async (req, res, next) => {
  try {
    const partners = await User.find({ role: 'delivery', isActive: true }).select('name email phone');
    res.json({ success: true, count: partners.length, partners });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Admin summary metrics
// @route   GET /api/users/dashboard-stats
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalOrders,
      totalMedicines,
      pendingPrescriptions,
      revenueResult,
      ordersByStatus,
      usersByRole
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Medicine.countDocuments({ isActive: true }),
      Prescription.countDocuments({ status: 'pending' }),
      Order.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ])
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalMedicines,
        pendingPrescriptions,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        ordersByStatus,
        usersByRole
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  updateUser,
  getDeliveryPartners,
  getAdminStats
};

