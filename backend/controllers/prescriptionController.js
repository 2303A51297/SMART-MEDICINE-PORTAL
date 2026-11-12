const Prescription = require('../models/Prescription');

// @desc    Upload new prescription
// @route   POST /api/prescriptions
// @access  Private (Customer)
const uploadPrescription = async (req, res, next) => {
  try {
    const { patientName, patientAge, doctorName, hospitalOrClinic, notes } = req.body;

    if (!req.file && !req.body.prescriptionFile) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a prescription image or document'
      });
    }

    const prescriptionFilePath = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.prescriptionFile;

    const prescription = await Prescription.create({
      customer: req.user._id,
      patientName: patientName || req.user.name,
      patientAge: patientAge ? parseInt(patientAge) : 30,
      doctorName: doctorName || 'Dr. Medical Practitioner',
      hospitalOrClinic: hospitalOrClinic || 'City General Hospital',
      prescriptionFile: prescriptionFilePath,
      notes: notes || '',
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      prescription
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescriptions for logged in customer
// @route   GET /api/prescriptions/my
// @access  Private (Customer)
const getMyPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ customer: req.user._id })
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: prescriptions.length,
      prescriptions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all prescriptions (Pharmacist / Admin)
// @route   GET /api/prescriptions
// @access  Private (Pharmacist / Admin)
const getAllPrescriptions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const prescriptions = await Prescription.find(query)
      .populate('customer', 'name email phone address')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: prescriptions.length,
      prescriptions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Review prescription (Approve or Reject)
// @route   PUT /api/prescriptions/:id/review
// @access  Private (Pharmacist)
const reviewPrescription = async (req, res, next) => {
  try {
    const { status, reviewNotes, validDays = 30 } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or rejected'
      });
    }

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    prescription.status = status;
    prescription.reviewNotes = reviewNotes || (status === 'approved' ? 'Verified and approved by licensed pharmacist.' : 'Prescription rejected due to incomplete doctor signature or expired date.');
    prescription.reviewedBy = req.user._id;
    prescription.reviewedAt = new Date();

    if (status === 'approved') {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + parseInt(validDays));
      prescription.validUntil = validUntil;
    }

    await prescription.save();

    const populated = await Prescription.findById(prescription._id)
      .populate('customer', 'name email phone')
      .populate('reviewedBy', 'name email');

    res.json({
      success: true,
      prescription: populated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadPrescription,
  getMyPrescriptions,
  getAllPrescriptions,
  reviewPrescription
};

