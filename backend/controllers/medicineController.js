const Medicine = require('../models/Medicine');
const MedicineBatch = require('../models/MedicineBatch');

// @desc    Get all medicines with search and filters
// @route   GET /api/medicines
// @access  Public
const getMedicines = async (req, res, next) => {
  try {
    const {
      search,
      category,
      prescriptionRequired,
      inStock,
      dosageForm,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    const query = { isActive: true };

    // Search by name, generic name, brand
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (prescriptionRequired !== undefined && prescriptionRequired !== '') {
      query.prescriptionRequired = prescriptionRequired === 'true';
    }

    if (inStock === 'true') {
      query.totalStock = { $gt: 0 };
    }

    if (dosageForm) {
      query.dosageForm = dosageForm;
    }

    // Sorting
    let sortOptions = { name: 1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'newest') sortOptions = { createdAt: -1 };
    if (sort === 'stock_desc') sortOptions = { totalStock: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [medicines, total] = await Promise.all([
      Medicine.find(query)
        .populate('category', 'name slug icon')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Medicine.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: medicines.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      medicines
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single medicine by ID with active batches
// @route   GET /api/medicines/:id
// @access  Public
const getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate('category', 'name slug icon');
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    const batches = await MedicineBatch.find({
      medicine: medicine._id,
      remainingQuantity: { $gt: 0 },
      status: 'active'
    }).sort({ expiryDate: 1 });

    res.json({
      success: true,
      medicine,
      batches
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new medicine
// @route   POST /api/medicines
// @access  Private (Pharmacist / Admin)
const createMedicine = async (req, res, next) => {
  try {
    const {
      name,
      genericName,
      brand,
      category,
      description,
      price,
      prescriptionRequired,
      dosageForm,
      strength,
      manufacturer,
      sideEffects,
      storageInstructions,
      image,
      reorderLevel
    } = req.body;

    const medicine = await Medicine.create({
      name,
      genericName,
      brand,
      category,
      description,
      price,
      prescriptionRequired: !!prescriptionRequired,
      dosageForm: dosageForm || 'Tablet',
      strength: strength || '500 mg',
      manufacturer: manufacturer || 'Cipla Health Ltd.',
      sideEffects: sideEffects || 'Consult your physician if symptoms persist.',
      storageInstructions: storageInstructions || 'Store in cool dry place',
      image: image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
      reorderLevel: reorderLevel ? parseInt(reorderLevel) : 25,
      totalStock: 0
    });

    const populated = await Medicine.findById(medicine._id).populate('category', 'name slug');
    res.status(201).json({ success: true, medicine: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private (Pharmacist / Admin)
const updateMedicine = async (req, res, next) => {
  try {
    let medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug');

    res.json({ success: true, medicine });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medicine (soft delete)
// @route   DELETE /api/medicines/:id
// @access  Private (Admin only)
const deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    medicine.isActive = false;
    await medicine.save();

    res.json({ success: true, message: 'Medicine deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine
};

