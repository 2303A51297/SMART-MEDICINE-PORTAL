import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Calendar,
  AlertTriangle,
  Search,
  Layers,
  ArrowUpDown,
  CheckCircle,
  Clock
} from 'lucide-react';

const InventoryManagementPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  // Tab State: 'medicines' or 'batches'
  const [activeTab, setActiveTab] = useState('medicines');

  // Modals State
  const [medicineModalOpen, setMedicineModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedMedForBatch, setSelectedMedForBatch] = useState(null);

  // Form State: Medicine
  const [medFormData, setMedFormData] = useState({
    name: '',
    genericName: '',
    brand: '',
    category: '',
    description: '',
    price: '',
    dosageForm: 'Tablet',
    strength: '500 mg',
    manufacturer: 'Cipla Ltd.',
    sideEffects: '',
    prescriptionRequired: false,
    reorderLevel: 25,
    image: ''
  });

  // Form State: Batch
  const [batchFormData, setBatchFormData] = useState({
    batchNumber: '',
    manufacturingDate: '',
    expiryDate: '',
    quantity: '',
    unitCost: '',
    supplier: 'Apollo Logistics'
  });

  const fetchData = async () => {
    try {
      const [medRes, catRes, batchRes] = await Promise.all([
        api.get('/medicines?limit=100'),
        api.get('/categories'),
        api.get('/batches')
      ]);

      if (medRes.data.success) setMedicines(medRes.data.medicines);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (batchRes.data.success) setBatches(batchRes.data.batches);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddMedicine = () => {
    setEditingMedicine(null);
    setMedFormData({
      name: '',
      genericName: '',
      brand: '',
      category: categories[0]?._id || '',
      description: '',
      price: '',
      dosageForm: 'Tablet',
      strength: '500 mg',
      manufacturer: 'Cipla Ltd.',
      sideEffects: '',
      prescriptionRequired: false,
      reorderLevel: 25,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'
    });
    setMedicineModalOpen(true);
  };

  const openEditMedicine = (med) => {
    setEditingMedicine(med);
    setMedFormData({
      name: med.name,
      genericName: med.genericName,
      brand: med.brand,
      category: med.category?._id || med.category,
      description: med.description,
      price: med.price,
      dosageForm: med.dosageForm,
      strength: med.strength,
      manufacturer: med.manufacturer,
      sideEffects: med.sideEffects,
      prescriptionRequired: med.prescriptionRequired,
      reorderLevel: med.reorderLevel,
      image: med.image
    });
    setMedicineModalOpen(true);
  };

  const handleSaveMedicine = async (e) => {
    e.preventDefault();
    try {
      if (editingMedicine) {
        await api.put(`/medicines/${editingMedicine._id}`, medFormData);
      } else {
        await api.post('/medicines', medFormData);
      }
      setMedicineModalOpen(false);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save medicine');
    }
  };

  const handleDeleteMedicine = async (medId) => {
    if (!window.confirm('Are you sure you want to deactivate this medicine?')) return;
    try {
      await api.delete(`/medicines/${medId}`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate medicine');
    }
  };

  const openAddBatch = (med) => {
    setSelectedMedForBatch(med);
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 2);
    const expDefault = nextYear.toISOString().split('T')[0];

    setBatchFormData({
      batchNumber: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
      manufacturingDate: today,
      expiryDate: expDefault,
      quantity: 50,
      unitCost: Math.round(med.price * 0.65),
      supplier: 'Apex Healthcare Distributors'
    });
    setBatchModalOpen(true);
  };

  const handleSaveBatch = async (e) => {
    e.preventDefault();
    try {
      await api.post('/batches', {
        ...batchFormData,
        medicine: selectedMedForBatch._id
      });
      setBatchModalOpen(false);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add batch');
    }
  };

  if (loading) return <Loader text="Loading pharmaceutical inventory..." />;

  // Filter medicines
  let filteredMeds = medicines;
  if (search) {
    filteredMeds = filteredMeds.filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.genericName.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (stockFilter === 'low') {
    filteredMeds = filteredMeds.filter(m => m.totalStock <= m.reorderLevel && m.totalStock > 0);
  } else if (stockFilter === 'out') {
    filteredMeds = filteredMeds.filter(m => m.totalStock === 0);
  } else if (stockFilter === 'healthy') {
    filteredMeds = filteredMeds.filter(m => m.totalStock > m.reorderLevel);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Medicine Inventory & Batch Management</h1>
          <p className="page-subtitle">CRUD operations, warehouse batch tracking, and expiry date monitoring</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={openAddMedicine} className="btn btn-primary">
            <Plus size={16} /> Add New Medicine
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('medicines')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'medicines' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'medicines' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          All Medicines ({medicines.length})
        </button>
        <button
          onClick={() => setActiveTab('batches')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'batches' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'batches' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Active Batches Archive ({batches.length})
        </button>
      </div>

      {activeTab === 'medicines' ? (
        <>
          {/* Filters Bar */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Filter medicines by name or salt..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div>
                <select
                  className="form-control"
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                >
                  <option value="">All Stock Levels</option>
                  <option value="healthy">Healthy Stock</option>
                  <option value="low">Low Stock Warning (Under Threshold)</option>
                  <option value="out">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Medicines Table */}
          <div className="card">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Medicine & Generic Salt</th>
                    <th>Category</th>
                    <th>Form & Strength</th>
                    <th>Price</th>
                    <th>Total Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeds.map((med) => {
                    const isLow = med.totalStock <= med.reorderLevel && med.totalStock > 0;
                    const isOut = med.totalStock === 0;

                    return (
                      <tr key={med._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img src={med.image} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                            <div>
                              <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{med.name}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{med.genericName}</div>
                              {med.prescriptionRequired && (
                                <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700 }}>• Rx Required</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{med.category?.name || 'General'}</td>
                        <td>{med.dosageForm} ({med.strength})</td>
                        <td><strong>₹{med.price.toFixed(2)}</strong></td>
                        <td>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{med.totalStock} units</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>Threshold: {med.reorderLevel}</div>
                        </td>
                        <td>
                          {isOut ? (
                            <Badge status="out of stock" />
                          ) : isLow ? (
                            <Badge status="low stock" />
                          ) : (
                            <Badge status="in stock" />
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => openAddBatch(med)}
                              className="btn btn-primary btn-sm"
                              title="Add stock batch"
                            >
                              <Plus size={14} /> Batch
                            </button>
                            <button
                              onClick={() => openEditMedicine(med)}
                              className="btn btn-outline btn-sm"
                              title="Edit medicine info"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteMedicine(med._id)}
                              className="btn btn-outline btn-sm"
                              style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
                              title="Deactivate"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Batches View */
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch Number</th>
                  <th>Medicine Name</th>
                  <th>Remaining Qty</th>
                  <th>Mfg Date</th>
                  <th>Expiry Date</th>
                  <th>Days Left</th>
                  <th>Supplier</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => {
                  const now = new Date();
                  const exp = new Date(b.expiryDate);
                  const daysLeft = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

                  let statusBadge = <Badge status="active" />;
                  if (daysLeft < 0) statusBadge = <Badge status="expired" />;
                  else if (daysLeft <= 30) statusBadge = <Badge status="low stock" text="Expiring <30d" />;

                  return (
                    <tr key={b._id}>
                      <td><strong>{b.batchNumber}</strong></td>
                      <td>{b.medicine?.name || 'Unknown'}</td>
                      <td><strong>{b.remainingQuantity}</strong> / {b.quantity}</td>
                      <td>{new Date(b.manufacturingDate).toLocaleDateString()}</td>
                      <td>{new Date(b.expiryDate).toLocaleDateString()}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: daysLeft <= 30 ? '#ef4444' : '#059669' }}>
                          {daysLeft < 0 ? `Expired (${Math.abs(daysLeft)}d ago)` : `${daysLeft} days`}
                        </span>
                      </td>
                      <td>{b.supplier}</td>
                      <td>{statusBadge}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Medicine Modal */}
      <Modal
        isOpen={medicineModalOpen}
        onClose={() => setMedicineModalOpen(false)}
        title={editingMedicine ? 'Edit Medicine Specifications' : 'Add New Medicine to Catalog'}
      >
        <form onSubmit={handleSaveMedicine}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Brand / Commercial Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Augmentin 625 Duo"
                value={medFormData.name}
                onChange={(e) => setMedFormData({ ...medFormData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Generic Chemical Salt</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Amoxicillin + Clavulanic Acid"
                value={medFormData.genericName}
                onChange={(e) => setMedFormData({ ...medFormData, genericName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Manufacturer</label>
              <input
                type="text"
                className="form-control"
                value={medFormData.manufacturer}
                onChange={(e) => setMedFormData({ ...medFormData, manufacturer: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Therapeutic Category</label>
              <select
                className="form-control"
                value={medFormData.category}
                onChange={(e) => setMedFormData({ ...medFormData, category: e.target.value })}
                required
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Dosage Form</label>
              <select
                className="form-control"
                value={medFormData.dosageForm}
                onChange={(e) => setMedFormData({ ...medFormData, dosageForm: e.target.value })}
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Ointment">Ointment</option>
                <option value="Injection">Injection</option>
                <option value="Inhaler">Inhaler</option>
                <option value="Drops">Drops</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Retail Price (₹)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={medFormData.price}
                onChange={(e) => setMedFormData({ ...medFormData, price: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reorder Level Alert Threshold</label>
              <input
                type="number"
                className="form-control"
                value={medFormData.reorderLevel}
                onChange={(e) => setMedFormData({ ...medFormData, reorderLevel: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description & Indications</label>
              <textarea
                className="form-control"
                rows="2"
                value={medFormData.description}
                onChange={(e) => setMedFormData({ ...medFormData, description: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Image URL</label>
              <input
                type="text"
                className="form-control"
                value={medFormData.image}
                onChange={(e) => setMedFormData({ ...medFormData, image: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={medFormData.prescriptionRequired}
                  onChange={(e) => setMedFormData({ ...medFormData, prescriptionRequired: e.target.checked })}
                />
                Requires Doctor Prescription (Schedule H / Rx Only)
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setMedicineModalOpen(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary">{editingMedicine ? 'Update Medicine' : 'Save Medicine'}</button>
          </div>
        </form>
      </Modal>

      {/* Add Batch Modal */}
      <Modal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        title={`Add Warehouse Stock Batch for: ${selectedMedForBatch?.name}`}
      >
        <form onSubmit={handleSaveBatch}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Batch Number</label>
              <input
                type="text"
                className="form-control"
                value={batchFormData.batchNumber}
                onChange={(e) => setBatchFormData({ ...batchFormData, batchNumber: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Batch Quantity (Units)</label>
              <input
                type="number"
                className="form-control"
                value={batchFormData.quantity}
                onChange={(e) => setBatchFormData({ ...batchFormData, quantity: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Manufacturing Date</label>
              <input
                type="date"
                className="form-control"
                value={batchFormData.manufacturingDate}
                onChange={(e) => setBatchFormData({ ...batchFormData, manufacturingDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Expiry Date</label>
              <input
                type="date"
                className="form-control"
                value={batchFormData.expiryDate}
                onChange={(e) => setBatchFormData({ ...batchFormData, expiryDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Purchase Unit Cost (₹)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={batchFormData.unitCost}
                onChange={(e) => setBatchFormData({ ...batchFormData, unitCost: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Supplier / Distributor</label>
              <input
                type="text"
                className="form-control"
                value={batchFormData.supplier}
                onChange={(e) => setBatchFormData({ ...batchFormData, supplier: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setBatchModalOpen(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary">Allocate Batch</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default InventoryManagementPage;

