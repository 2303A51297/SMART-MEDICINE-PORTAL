const MedicineBatch = require('../models/MedicineBatch');
const Medicine = require('../models/Medicine');

// Helper to recalculate total medicine stock
const recalculateMedicineStock = async (medicineId) => {
  const activeBatches = await MedicineBatch.find({
    medicine: medicineId,
    status: 'active',
    expiryDate: { $gt: new Date() }
  });

  const total = activeBatches.reduce((sum, b) => sum + (b.remainingQuantity || 0), 0);
  await Medicine.findByIdAndUpdate(medicineId, { totalStock: total });
  return total;
};

// @desc    Get all batches for a medicine
// @route   GET /api/batches/medicine/:medicineId
// @access  Private (Pharmacist / Admin)
const getBatchesByMedicine = async (req, res, next) => {
  try {
    const batches = await MedicineBatch.find({ medicine: req.params.medicineId })
      .sort({ expiryDate: 1 });
    res.json({ success: true, count: batches.length, batches });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all batches across all medicines with filters
// @route   GET /api/batches
// @access  Private (Pharmacist / Admin)
const getAllBatches = async (req, res, next) => {
  try {
    const { status, expiringSoon } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (expiringSoon === 'true') {
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
      query.expiryDate = { $lte: ninetyDaysFromNow };
    }

    const batches = await MedicineBatch.find(query)
      .populate('medicine', 'name genericName brand price totalStock')
      .sort({ expiryDate: 1 });

    res.json({ success: true, count: batches.length, batches });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new medicine batch
// @route   POST /api/batches
// @access  Private (Pharmacist / Admin)
const createBatch = async (req, res, next) => {
  try {
    const {
      medicine,
      batchNumber,
      manufacturingDate,
      expiryDate,
      quantity,
      unitCost,
      supplier
    } = req.body;

    const med = await Medicine.findById(medicine);
    if (!med) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    const existingBatch = await MedicineBatch.findOne({ medicine, batchNumber });
    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: `Batch ${batchNumber} already exists for this medicine`
      });
    }

    const batch = await MedicineBatch.create({
      medicine,
      batchNumber,
      manufacturingDate,
      expiryDate,
      quantity,
      remainingQuantity: quantity,
      unitCost: unitCost || 0,
      supplier: supplier || 'Global Pharma Distributors',
      status: 'active'
    });

    // Update total stock on medicine
    await recalculateMedicineStock(medicine);

    const populated = await MedicineBatch.findById(batch._id).populate('medicine', 'name genericName');

    res.status(201).json({ success: true, batch: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update batch
// @route   PUT /api/batches/:id
// @access  Private (Pharmacist / Admin)
const updateBatch = async (req, res, next) => {
  try {
    let batch = await MedicineBatch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const { remainingQuantity, status, expiryDate, unitCost, supplier } = req.body;

    if (remainingQuantity !== undefined) batch.remainingQuantity = remainingQuantity;
    if (status !== undefined) batch.status = status;
    if (expiryDate !== undefined) batch.expiryDate = expiryDate;
    if (unitCost !== undefined) batch.unitCost = unitCost;
    if (supplier !== undefined) batch.supplier = supplier;

    if (batch.remainingQuantity === 0) {
      batch.status = 'exhausted';
    }

    await batch.save();
    await recalculateMedicineStock(batch.medicine);

    res.json({ success: true, batch });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expiring / expired batches summary
// @route   GET /api/batches/expiring-summary
// @access  Private (Pharmacist / Admin)
const getExpiringSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const [expired, within30, within60, within90] = await Promise.all([
      MedicineBatch.countDocuments({ expiryDate: { $lt: now }, status: { $ne: 'exhausted' } }),
      MedicineBatch.countDocuments({ expiryDate: { $gte: now, $lte: in30Days }, status: 'active' }),
      MedicineBatch.countDocuments({ expiryDate: { $gt: in30Days, $lte: in60Days }, status: 'active' }),
      MedicineBatch.countDocuments({ expiryDate: { $gt: in60Days, $lte: in90Days }, status: 'active' })
    ]);

    res.json({
      success: true,
      summary: {
        expired,
        within30Days: within30,
        within60Days: within60,
        within90Days: within90
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBatchesByMedicine,
  getAllBatches,
  createBatch,
  updateBatch,
  getExpiringSummary,
  recalculateMedicineStock
};

