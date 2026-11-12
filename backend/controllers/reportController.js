const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const MedicineBatch = require('../models/MedicineBatch');
const User = require('../models/User');

// Helper to parse date filters
const parseDateRange = (startDate, endDate) => {
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      match.createdAt.$lte = end;
    }
  }
  return match;
};

// 1. MEDICINE SALES REPORT
// @route   GET /api/reports/sales
// @access  Private (Admin / Pharmacist)
const getMedicineSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, category, search } = req.query;
    const matchStage = {
      orderStatus: { $ne: 'cancelled' },
      paymentStatus: 'completed'
    };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = end;
      }
    }

    const salesData = await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.medicine',
          medicineName: { $first: '$items.name' },
          unitsSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
          orderOccurrences: { $sum: 1 },
          avgPrice: { $avg: '$items.price' }
        }
      },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: '_id',
          as: 'medicineDetails'
        }
      },
      { $unwind: { path: '$medicineDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'medicineDetails.category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          medicineId: '$_id',
          name: '$medicineName',
          genericName: '$medicineDetails.genericName',
          categoryName: '$categoryDetails.name',
          unitsSold: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          orderOccurrences: 1,
          avgPrice: { $round: ['$avgPrice', 2] },
          currentStock: '$medicineDetails.totalStock'
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // In-memory filter for category or search text if specified
    let filtered = salesData;
    if (category) {
      filtered = filtered.filter(item => item.categoryName && item.categoryName.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      filtered = filtered.filter(item =>
        (item.name && item.name.toLowerCase().includes(search.toLowerCase())) ||
        (item.genericName && item.genericName.toLowerCase().includes(search.toLowerCase()))
      );
    }

    const summary = {
      totalRevenue: filtered.reduce((acc, curr) => acc + curr.totalRevenue, 0),
      totalUnitsSold: filtered.reduce((acc, curr) => acc + curr.unitsSold, 0),
      uniqueMedicinesSold: filtered.length,
      topSellingMedicine: filtered.length > 0 ? filtered[0].name : 'N/A'
    };

    summary.totalRevenue = Math.round(summary.totalRevenue * 100) / 100;

    res.json({
      success: true,
      reportType: 'Medicine Sales Report',
      generatedAt: new Date(),
      summary,
      data: filtered
    });
  } catch (error) {
    next(error);
  }
};

// 2. MEDICINE STOCK REPORT
// @route   GET /api/reports/stock
// @access  Private (Admin / Pharmacist)
const getMedicineStockReport = async (req, res, next) => {
  try {
    const { category, stockStatus, search } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } }
      ];
    }

    const medicines = await Medicine.find(query)
      .populate('category', 'name')
      .sort({ totalStock: 1 });

    const batches = await MedicineBatch.find({ status: 'active' });
    const batchMap = {};
    batches.forEach(b => {
      const id = b.medicine.toString();
      if (!batchMap[id]) batchMap[id] = [];
      batchMap[id].push(b);
    });

    let stockData = medicines.map(med => {
      const medBatches = batchMap[med._id.toString()] || [];
      const batchCount = medBatches.length;
      const isLowStock = med.totalStock <= med.reorderLevel && med.totalStock > 0;
      const isOutOfStock = med.totalStock === 0;
      const inventoryValuation = Math.round(med.totalStock * med.price * 100) / 100;

      let status = 'In Stock';
      if (isOutOfStock) status = 'Out of Stock';
      else if (isLowStock) status = 'Low Stock';

      return {
        medicineId: med._id,
        name: med.name,
        genericName: med.genericName,
        brand: med.brand,
        categoryName: med.category ? med.category.name : 'General',
        dosageForm: med.dosageForm,
        unitPrice: med.price,
        totalStock: med.totalStock,
        reorderLevel: med.reorderLevel,
        status,
        batchCount,
        inventoryValuation
      };
    });

    if (stockStatus) {
      stockData = stockData.filter(item => item.status.toLowerCase() === stockStatus.toLowerCase());
    }

    const summary = {
      totalMedicines: stockData.length,
      totalInventoryValuation: Math.round(stockData.reduce((acc, curr) => acc + curr.inventoryValuation, 0) * 100) / 100,
      totalStockUnits: stockData.reduce((acc, curr) => acc + curr.totalStock, 0),
      lowStockCount: stockData.filter(i => i.status === 'Low Stock').length,
      outOfStockCount: stockData.filter(i => i.status === 'Out of Stock').length,
      healthyStockCount: stockData.filter(i => i.status === 'In Stock').length
    };

    res.json({
      success: true,
      reportType: 'Medicine Stock Report',
      generatedAt: new Date(),
      summary,
      data: stockData
    });
  } catch (error) {
    next(error);
  }
};

// 3. EXPIRY TRACKING REPORT
// @route   GET /api/reports/expiry
// @access  Private (Admin / Pharmacist)
const getExpiryTrackingReport = async (req, res, next) => {
  try {
    const { statusFilter, search } = req.query;
    const now = new Date();

    const batches = await MedicineBatch.find({ remainingQuantity: { $gt: 0 } })
      .populate({
        path: 'medicine',
        select: 'name genericName brand price category',
        populate: { path: 'category', select: 'name' }
      })
      .sort({ expiryDate: 1 });

    const enrichedBatches = batches.map(b => {
      const diffTime = b.expiryDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const financialRisk = Math.round(b.remainingQuantity * (b.unitCost || (b.medicine ? b.medicine.price * 0.7 : 0)) * 100) / 100;

      let riskCategory = 'Safe';
      if (daysLeft < 0) riskCategory = 'Expired';
      else if (daysLeft <= 30) riskCategory = 'Expiring in 30 Days';
      else if (daysLeft <= 60) riskCategory = 'Expiring in 60 Days';
      else if (daysLeft <= 90) riskCategory = 'Expiring in 90 Days';

      return {
        batchId: b._id,
        batchNumber: b.batchNumber,
        medicineName: b.medicine ? b.medicine.name : 'Unknown Medicine',
        genericName: b.medicine ? b.medicine.genericName : '',
        category: b.medicine && b.medicine.category ? b.medicine.category.name : 'General',
        remainingQuantity: b.remainingQuantity,
        unitCost: b.unitCost || 0,
        financialRisk,
        manufacturingDate: b.manufacturingDate,
        expiryDate: b.expiryDate,
        daysLeft,
        riskCategory,
        supplier: b.supplier
      };
    });

    let filtered = enrichedBatches;
    if (statusFilter) {
      filtered = filtered.filter(item => item.riskCategory.toLowerCase() === statusFilter.toLowerCase());
    }
    if (search) {
      filtered = filtered.filter(item =>
        item.medicineName.toLowerCase().includes(search.toLowerCase()) ||
        item.batchNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    const summary = {
      totalBatchesMonitored: enrichedBatches.length,
      expiredCount: enrichedBatches.filter(b => b.riskCategory === 'Expired').length,
      expiring30DaysCount: enrichedBatches.filter(b => b.riskCategory === 'Expiring in 30 Days').length,
      expiring60DaysCount: enrichedBatches.filter(b => b.riskCategory === 'Expiring in 60 Days').length,
      expiring90DaysCount: enrichedBatches.filter(b => b.riskCategory === 'Expiring in 90 Days').length,
      totalFinancialRisk: Math.round(
        enrichedBatches
          .filter(b => b.daysLeft <= 90)
          .reduce((acc, curr) => acc + curr.financialRisk, 0) * 100
      ) / 100
    };

    res.json({
      success: true,
      reportType: 'Expiry Tracking Report',
      generatedAt: new Date(),
      summary,
      data: filtered
    });
  } catch (error) {
    next(error);
  }
};

// 4. CUSTOMER ORDER REPORT
// @route   GET /api/reports/customer-orders
// @access  Private (Admin / Pharmacist)
const getCustomerOrderReport = async (req, res, next) => {
  try {
    const { startDate, endDate, status, paymentStatus, search } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('deliveryPartner', 'name')
      .sort({ createdAt: -1 });

    let orderData = orders.map(ord => ({
      orderId: ord._id,
      orderNumber: ord.orderNumber,
      customerName: ord.customer ? ord.customer.name : 'Guest/Deleted',
      customerEmail: ord.customer ? ord.customer.email : '',
      customerPhone: ord.customer ? ord.customer.phone : ord.shippingAddress.phone,
      itemCount: ord.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: ord.subtotal,
      tax: ord.tax,
      deliveryFee: ord.deliveryFee,
      totalAmount: ord.totalAmount,
      paymentMethod: ord.paymentMethod.toUpperCase(),
      paymentStatus: ord.paymentStatus,
      orderStatus: ord.orderStatus,
      orderDate: ord.createdAt,
      city: ord.shippingAddress ? ord.shippingAddress.city : ''
    }));

    if (search) {
      orderData = orderData.filter(o =>
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(search.toLowerCase())
      );
    }

    const summary = {
      totalOrders: orderData.length,
      totalGrossSales: Math.round(orderData.reduce((sum, o) => sum + o.totalAmount, 0) * 100) / 100,
      averageOrderValue: orderData.length > 0
        ? Math.round((orderData.reduce((sum, o) => sum + o.totalAmount, 0) / orderData.length) * 100) / 100
        : 0,
      completedOrders: orderData.filter(o => o.orderStatus === 'delivered').length,
      pendingOrders: orderData.filter(o => ['placed', 'confirmed', 'packed', 'out_for_delivery'].includes(o.orderStatus)).length,
      cancelledOrders: orderData.filter(o => o.orderStatus === 'cancelled').length
    };

    res.json({
      success: true,
      reportType: 'Customer Order Report',
      generatedAt: new Date(),
      summary,
      data: orderData
    });
  } catch (error) {
    next(error);
  }
};

// CSV EXPORT HANDLER
// @route   GET /api/reports/export-csv
// @access  Private (Admin / Pharmacist)
const exportReportCSV = async (req, res, next) => {
  try {
    const { type } = req.query;
    let filename = `report-${type || 'export'}-${Date.now()}.csv`;
    let csvContent = '';

    if (type === 'sales') {
      filename = `medicine-sales-report-${Date.now()}.csv`;
      const report = await Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' }, paymentStatus: 'completed' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.medicine',
            name: { $first: '$items.name' },
            unitsSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.subtotal' },
            avgPrice: { $avg: '$items.price' }
          }
        }
      ]);

      csvContent = 'Medicine Name,Units Sold,Total Revenue (INR),Average Price (INR)\n';
      report.forEach(r => {
        csvContent += `"${r.name.replace(/"/g, '""')}",${r.unitsSold},${Math.round(r.totalRevenue * 100) / 100},${Math.round(r.avgPrice * 100) / 100}\n`;
      });
    } else if (type === 'stock') {
      filename = `medicine-stock-report-${Date.now()}.csv`;
      const medicines = await Medicine.find({ isActive: true }).populate('category', 'name');
      csvContent = 'Medicine Name,Generic Name,Category,Price,Total Stock,Reorder Level,Status\n';
      medicines.forEach(m => {
        const status = m.totalStock === 0 ? 'Out of Stock' : (m.totalStock <= m.reorderLevel ? 'Low Stock' : 'In Stock');
        csvContent += `"${m.name.replace(/"/g, '""')}","${m.genericName.replace(/"/g, '""')}","${m.category ? m.category.name : 'General'}",${m.price},${m.totalStock},${m.reorderLevel},${status}\n`;
      });
    } else if (type === 'expiry') {
      filename = `expiry-tracking-report-${Date.now()}.csv`;
      const batches = await MedicineBatch.find({ remainingQuantity: { $gt: 0 } }).populate('medicine', 'name');
      csvContent = 'Batch Number,Medicine Name,Remaining Quantity,Expiry Date,Status\n';
      batches.forEach(b => {
        const expStr = b.expiryDate ? new Date(b.expiryDate).toISOString().split('T')[0] : '';
        const medName = b.medicine ? b.medicine.name : 'Unknown';
        csvContent += `"${b.batchNumber}","${medName.replace(/"/g, '""')}",${b.remainingQuantity},${expStr},${b.status}\n`;
      });
    } else {
      filename = `customer-orders-report-${Date.now()}.csv`;
      const orders = await Order.find().populate('customer', 'name email');
      csvContent = 'Order Number,Customer Name,Customer Email,Total Amount (INR),Payment Status,Order Status,Date\n';
      orders.forEach(o => {
        const custName = o.customer ? o.customer.name : 'Guest';
        const custEmail = o.customer ? o.customer.email : '';
        const dateStr = o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : '';
        csvContent += `"${o.orderNumber}","${custName}","${custEmail}",${o.totalAmount},${o.paymentStatus},${o.orderStatus},${dateStr}\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicineSalesReport,
  getMedicineStockReport,
  getExpiryTrackingReport,
  getCustomerOrderReport,
  exportReportCSV
};

