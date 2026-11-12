import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import { BarChart, DonutChart } from '../../components/charts/InteractiveCharts';
import {
  BarChart3,
  Download,
  Calendar,
  Search,
  IndianRupee,
  Package,
  AlertTriangle,
  ShoppingBag,
  TrendingUp,
  Layers,
  Clock,
  Filter
} from 'lucide-react';

const ReportsAnalyticsPage = () => {
  const [activeReport, setActiveReport] = useState('sales'); // 'sales', 'stock', 'expiry', 'orders'
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [secondaryFilter, setSecondaryFilter] = useState('');

  // Report Data States
  const [reportData, setReportData] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (search) params.append('search', search);

      let endpoint = '/reports/sales';
      if (activeReport === 'stock') {
        endpoint = '/reports/stock';
        if (secondaryFilter) params.append('stockStatus', secondaryFilter);
      } else if (activeReport === 'expiry') {
        endpoint = '/reports/expiry';
        if (secondaryFilter) params.append('statusFilter', secondaryFilter);
      } else if (activeReport === 'orders') {
        endpoint = '/reports/customer-orders';
        if (secondaryFilter) params.append('status', secondaryFilter);
      }

      const res = await api.get(`${endpoint}?${params.toString()}`);
      if (res.data.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeReport, startDate, endDate, secondaryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('token');
    const url = `/api/reports/export-csv?type=${activeReport}`;
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `${activeReport}-report.csv`);
    document.body.appendChild(a);
    // Fetch with auth and download
    api.get(url, { responseType: 'blob' }).then(response => {
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      a.href = downloadUrl;
      a.click();
      a.remove();
    }).catch(err => {
      console.error('CSV Export failed:', err);
      alert('CSV Export failed. Please check your permissions.');
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Mandatory Pharmacy Analytics & Reports</h1>
          <p className="page-subtitle">Real-time MongoDB aggregated reporting with interactive visualizations and CSV export</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary">
            <Download size={16} /> Export to CSV
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        <button
          onClick={() => { setActiveReport('sales'); setSecondaryFilter(''); }}
          className={`btn ${activeReport === 'sales' ? 'btn-primary' : 'btn-outline'}`}
        >
          <IndianRupee size={16} /> 1. Medicine Sales Report
        </button>
        <button
          onClick={() => { setActiveReport('stock'); setSecondaryFilter(''); }}
          className={`btn ${activeReport === 'stock' ? 'btn-primary' : 'btn-outline'}`}
        >
          <Package size={16} /> 2. Medicine Stock Report
        </button>
        <button
          onClick={() => { setActiveReport('expiry'); setSecondaryFilter(''); }}
          className={`btn ${activeReport === 'expiry' ? 'btn-primary' : 'btn-outline'}`}
        >
          <AlertTriangle size={16} /> 3. Expiry Tracking Report
        </button>
        <button
          onClick={() => { setActiveReport('orders'); setSecondaryFilter(''); }}
          className={`btn ${activeReport === 'orders' ? 'btn-primary' : 'btn-outline'}`}
        >
          <ShoppingBag size={16} /> 4. Customer Order Report
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Search Keywords</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.2rem' }}
                placeholder="Search report items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Start Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>End Date</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Contextual secondary filter */}
          {activeReport === 'stock' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Stock Status Filter</label>
              <select
                className="form-control"
                value={secondaryFilter}
                onChange={(e) => setSecondaryFilter(e.target.value)}
              >
                <option value="">All Stock Levels</option>
                <option value="in stock">In Stock Only</option>
                <option value="low stock">Low Stock Warning</option>
                <option value="out of stock">Out of Stock</option>
              </select>
            </div>
          )}

          {activeReport === 'expiry' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Expiry Risk Horizon</label>
              <select
                className="form-control"
                value={secondaryFilter}
                onChange={(e) => setSecondaryFilter(e.target.value)}
              >
                <option value="">All Batches</option>
                <option value="expiring in 30 days">Expiring in &le; 30 Days</option>
                <option value="expiring in 60 days">Expiring in 31-60 Days</option>
                <option value="expiring in 90 days">Expiring in 61-90 Days</option>
                <option value="expired">Already Expired</option>
              </select>
            </div>
          )}

          {activeReport === 'orders' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Order Status Filter</label>
              <select
                className="form-control"
                value={secondaryFilter}
                onChange={(e) => setSecondaryFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="delivered">Delivered Only</option>
                <option value="placed">Placed / Pending</option>
                <option value="out_for_delivery">Out for Delivery</option>
              </select>
            </div>
          )}

          <div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Filter size={16} /> Apply Filters
            </button>
          </div>

        </form>
      </div>

      {loading ? (
        <Loader text={`Compiling ${activeReport} report from MongoDB aggregations...`} />
      ) : (
        <>
          {/* ========================================================
              REPORT 1: MEDICINE SALES REPORT
             ======================================================== */}
          {activeReport === 'sales' && (
            <div>
              {/* Summary Cards */}
              <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
                <StatCard
                  icon={IndianRupee}
                  label="Total Sales Revenue"
                  value={`₹${reportData?.summary?.totalRevenue?.toLocaleString() || '0'}`}
                  subtext="Settled transactions"
                  color="#10b981"
                  bg="#d1fae5"
                />
                <StatCard
                  icon={Package}
                  label="Total Units Sold"
                  value={reportData?.summary?.totalUnitsSold || 0}
                  subtext="Dispensed medicine strips"
                  color="#0284c7"
                  bg="#e0f2fe"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Top Selling Medicine"
                  value={reportData?.summary?.topSellingMedicine || 'N/A'}
                  subtext="Highest aggregate revenue"
                  color="#8b5cf6"
                  bg="#ede9fe"
                />
                <StatCard
                  icon={Layers}
                  label="Formulations Sold"
                  value={reportData?.summary?.uniqueMedicinesSold || 0}
                  subtext="Distinct products ordered"
                  color="#f59e0b"
                  bg="#fef3c7"
                />
              </div>

              {/* Bar Chart of Top Medicines by Revenue */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Revenue Comparison by Medicine Formulation (₹)
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Visual comparison of sales turnover across therapeutic products
                </p>
                <BarChart
                  data={reportData?.data?.map(d => ({ name: d.name, value: d.totalRevenue, color: '#0284c7' }))}
                  xKey="name"
                  yKey="value"
                  height={240}
                />
              </div>

              {/* Data Table */}
              <div className="card">
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>
                  Detailed Medicine Sales Ledger
                </h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Medicine Name</th>
                        <th>Generic Salt</th>
                        <th>Category</th>
                        <th>Units Sold</th>
                        <th>Average Unit Price</th>
                        <th>Total Revenue</th>
                        <th>Current Stock Remaining</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData?.data?.map((row, idx) => (
                        <tr key={idx}>
                          <td><strong>{row.name}</strong></td>
                          <td>{row.genericName}</td>
                          <td>{row.categoryName || 'General'}</td>
                          <td><strong>{row.unitsSold}</strong></td>
                          <td>₹{row.avgPrice}</td>
                          <td><strong style={{ color: '#059669', fontSize: '1rem' }}>₹{row.totalRevenue}</strong></td>
                          <td>{row.currentStock} units</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              REPORT 2: MEDICINE STOCK REPORT
             ======================================================== */}
          {activeReport === 'stock' && (
            <div>
              {/* Summary Cards */}
              <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
                <StatCard
                  icon={IndianRupee}
                  label="Inventory Valuation"
                  value={`₹${reportData?.summary?.totalInventoryValuation?.toLocaleString() || '0'}`}
                  subtext="Asset value at retail pricing"
                  color="#0284c7"
                  bg="#e0f2fe"
                />
                <StatCard
                  icon={Package}
                  label="Total Units in Stock"
                  value={reportData?.summary?.totalStockUnits?.toLocaleString() || 0}
                  subtext="Across all warehouse batches"
                  color="#10b981"
                  bg="#d1fae5"
                />
                <StatCard
                  icon={AlertTriangle}
                  label="Low Stock Warnings"
                  value={reportData?.summary?.lowStockCount || 0}
                  subtext="Medicines below reorder level"
                  color="#f59e0b"
                  bg="#fef3c7"
                />
                <StatCard
                  icon={Layers}
                  label="Out of Stock"
                  value={reportData?.summary?.outOfStockCount || 0}
                  subtext="Immediate replenishment needed"
                  color="#ef4444"
                  bg="#fee2e2"
                />
              </div>

              {/* Chart: Stock Health Distribution */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Pharmacy Inventory Health Breakdown
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Classification between healthy reserves, low stock thresholds, and stockouts
                </p>
                <DonutChart
                  segments={[
                    { label: 'Healthy Stock', value: reportData?.summary?.healthyStockCount, color: '#10b981' },
                    { label: 'Low Stock Warning', value: reportData?.summary?.lowStockCount, color: '#f59e0b' },
                    { label: 'Out of Stock', value: reportData?.summary?.outOfStockCount, color: '#ef4444' }
                  ]}
                  centerValue={reportData?.summary?.totalMedicines}
                  centerLabel="Products"
                />
              </div>

              {/* Table */}
              <div className="card">
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>
                  Warehouse Stock Audit Log
                </h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Generic Salt</th>
                        <th>Category</th>
                        <th>Unit Price</th>
                        <th>Stock Available</th>
                        <th>Reorder Level</th>
                        <th>Inventory Valuation</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData?.data?.map((m) => (
                        <tr key={m.medicineId}>
                          <td><strong>{m.name}</strong></td>
                          <td>{m.genericName}</td>
                          <td>{m.categoryName}</td>
                          <td>₹{m.unitPrice}</td>
                          <td><strong>{m.totalStock} units</strong></td>
                          <td>{m.reorderLevel}</td>
                          <td>₹{m.inventoryValuation.toLocaleString()}</td>
                          <td><Badge status={m.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              REPORT 3: EXPIRY TRACKING REPORT
             ======================================================== */}
          {activeReport === 'expiry' && (
            <div>
              {/* Summary Cards */}
              <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
                <StatCard
                  icon={IndianRupee}
                  label="Financial Value at Risk"
                  value={`₹${reportData?.summary?.totalFinancialRisk?.toLocaleString() || '0'}`}
                  subtext="Batches expiring within 90 days"
                  color="#ef4444"
                  bg="#fee2e2"
                />
                <StatCard
                  icon={AlertTriangle}
                  label="Expiring in &le; 30 Days"
                  value={reportData?.summary?.expiring30DaysCount || 0}
                  subtext="Critical FEFO clearance priority"
                  color="#f59e0b"
                  bg="#fef3c7"
                />
                <StatCard
                  icon={Clock}
                  label="Expiring 31-60 Days"
                  value={reportData?.summary?.expiring60DaysCount || 0}
                  subtext="Moderate replenishment risk"
                  color="#0284c7"
                  bg="#e0f2fe"
                />
                <StatCard
                  icon={Package}
                  label="Already Expired"
                  value={reportData?.summary?.expiredCount || 0}
                  subtext="Quarantine & recall required"
                  color="#991b1b"
                  bg="#fee2e2"
                />
              </div>

              {/* Chart: Expiry Risk Distribution */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Batch Expiry Risk Distribution (Horizon Analysis)
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Early warning categorization to prevent drug wastage and financial loss
                </p>
                <DonutChart
                  segments={[
                    { label: 'Expired', value: reportData?.summary?.expiredCount, color: '#991b1b' },
                    { label: 'Critical (≤30 Days)', value: reportData?.summary?.expiring30DaysCount, color: '#ef4444' },
                    { label: 'Expiring in 60 Days', value: reportData?.summary?.expiring60DaysCount, color: '#f59e0b' },
                    { label: 'Expiring in 90 Days', value: reportData?.summary?.expiring90DaysCount, color: '#38bdf8' }
                  ]}
                  centerValue={reportData?.summary?.totalBatchesMonitored}
                  centerLabel="Batches"
                />
              </div>

              {/* Table */}
              <div className="card">
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>
                  Batch Expiry Monitoring Schedule
                </h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Batch #</th>
                        <th>Medicine Name</th>
                        <th>Remaining Qty</th>
                        <th>Expiry Date</th>
                        <th>Days Left</th>
                        <th>Risk Tier</th>
                        <th>Financial Loss at Risk</th>
                        <th>Distributor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData?.data?.map((b) => (
                        <tr key={b.batchId}>
                          <td><strong>{b.batchNumber}</strong></td>
                          <td>{b.medicineName}</td>
                          <td><strong>{b.remainingQuantity} units</strong></td>
                          <td>{new Date(b.expiryDate).toLocaleDateString()}</td>
                          <td>
                            <strong style={{ color: b.daysLeft <= 30 ? '#ef4444' : '#059669' }}>
                              {b.daysLeft < 0 ? `Expired (${Math.abs(b.daysLeft)}d)` : `${b.daysLeft} days`}
                            </strong>
                          </td>
                          <td><Badge status={b.riskCategory} text={b.riskCategory} /></td>
                          <td>₹{b.financialRisk.toFixed(2)}</td>
                          <td>{b.supplier}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              REPORT 4: CUSTOMER ORDER REPORT
             ======================================================== */}
          {activeReport === 'orders' && (
            <div>
              {/* Summary Cards */}
              <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
                <StatCard
                  icon={IndianRupee}
                  label="Total Gross Sales"
                  value={`₹${reportData?.summary?.totalGrossSales?.toLocaleString() || '0'}`}
                  subtext="Gross platform order volume"
                  color="#10b981"
                  bg="#d1fae5"
                />
                <StatCard
                  icon={ShoppingBag}
                  label="Total Placed Orders"
                  value={reportData?.summary?.totalOrders || 0}
                  subtext="Customer orders received"
                  color="#0284c7"
                  bg="#e0f2fe"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Average Order Value"
                  value={`₹${reportData?.summary?.averageOrderValue || '0'}`}
                  subtext="AOV per patient transaction"
                  color="#8b5cf6"
                  bg="#ede9fe"
                />
                <StatCard
                  icon={Package}
                  label="Completed Deliveries"
                  value={reportData?.summary?.completedOrders || 0}
                  subtext="Full delivery fulfillment"
                  color="#0d9488"
                  bg="#ccfbf1"
                />
              </div>

              {/* Data Table */}
              <div className="card">
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>
                  Customer Order Log & Payment Tracking
                </h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Order Date</th>
                        <th>Customer / Patient</th>
                        <th>Items Count</th>
                        <th>Total Amount</th>
                        <th>Payment Method</th>
                        <th>Payment Status</th>
                        <th>Fulfillment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData?.data?.map((ord) => (
                        <tr key={ord.orderId}>
                          <td><strong style={{ color: 'var(--primary)' }}>{ord.orderNumber}</strong></td>
                          <td>{new Date(ord.orderDate).toLocaleDateString()}</td>
                          <td>
                            <strong>{ord.customerName}</strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ord.customerEmail}</div>
                          </td>
                          <td>{ord.itemCount} items</td>
                          <td><strong>₹{ord.totalAmount.toFixed(2)}</strong></td>
                          <td>{ord.paymentMethod}</td>
                          <td><Badge status={ord.paymentStatus} /></td>
                          <td><Badge status={ord.orderStatus} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </>
      )}

    </div>
  );
};

export default ReportsAnalyticsPage;

