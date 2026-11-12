import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { Search, Filter, Plus, Check, AlertCircle, ShoppingCart } from 'lucide-react';

const MedicineCatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters from query params or state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [prescriptionFilter, setPrescriptionFilter] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('name');

  const { addToCart } = useCart();
  const [addedNotice, setAddedNotice] = useState(null);

  // Fetch categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) setCategories(res.data.categories);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch medicines when filters change
  useEffect(() => {
    const fetchMeds = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedCategory) params.append('category', selectedCategory);
        if (prescriptionFilter !== '') params.append('prescriptionRequired', prescriptionFilter);
        if (inStockOnly) params.append('inStock', 'true');
        if (sort) params.append('sort', sort);

        const res = await api.get(`/medicines?${params.toString()}`);
        if (res.data.success) {
          setMedicines(res.data.medicines);
          setTotal(res.data.total);
        }
      } catch (err) {
        console.error('Failed to load medicines:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeds();
  }, [search, selectedCategory, prescriptionFilter, inStockOnly, sort]);

  const handleAddToCart = (medicine) => {
    addToCart(medicine, 1);
    setAddedNotice(medicine.name);
    setTimeout(() => setAddedNotice(null), 2500);
  };

  return (
    <div>
      {/* Toast Notice */}
      {addedNotice && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: '#0f172a',
          color: '#fff',
          padding: '0.85rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 1000
        }}>
          <Check size={18} color="#10b981" />
          <span>Added <strong>{addedNotice}</strong> to cart!</span>
          <Link to="/cart" style={{ color: '#38bdf8', fontWeight: 700, marginLeft: '0.5rem' }}>View Cart</Link>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Pharmacy Medicine Catalog</h1>
          <p className="page-subtitle">Showing {total} authenticated pharmaceutical formulations</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by brand or salt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              className="form-control"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Therapeutic Classes</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Rx Filter */}
          <div>
            <select
              className="form-control"
              value={prescriptionFilter}
              onChange={(e) => setPrescriptionFilter(e.target.value)}
            >
              <option value="">All Medicine Types</option>
              <option value="true">Prescription Required (Rx Only)</option>
              <option value="false">Over The Counter (OTC)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              className="form-control"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="name">Sort: A to Z</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock_desc">Highest Stock First</option>
            </select>
          </div>

        </div>

        {/* Category Pills Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setSelectedCategory('')}
            className={`btn btn-sm ${selectedCategory === '' ? 'btn-primary' : 'btn-outline'}`}
          >
            All Medicines
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`btn btn-sm ${selectedCategory === cat._id ? 'btn-primary' : 'btn-outline'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <Loader text="Filtering pharmaceutical catalog..." />
      ) : medicines.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <AlertCircle size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>No matching medicines found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Try clearing or relaxing your search and category filters</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory(''); setPrescriptionFilter(''); }}
            className="btn btn-outline"
            style={{ marginTop: '1.25rem' }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid-cols-3">
          {medicines.map((med) => (
            <div key={med._id} className="medicine-card">
              <div className="medicine-image-wrapper">
                <img src={med.image} alt={med.name} className="medicine-image" />
                
                {/* Rx Badge */}
                {med.prescriptionRequired ? (
                  <span style={{ position: 'absolute', top: 12, right: 12, background: '#ef4444', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '6px', boxShadow: '0 2px 6px rgba(239,68,68,0.4)' }}>
                    Rx Required
                  </span>
                ) : (
                  <span style={{ position: 'absolute', top: 12, right: 12, background: '#10b981', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                    OTC Available
                  </span>
                )}

                {/* Dosage Form Chip */}
                <span style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(15,23,42,0.8)', color: '#fff', fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                  {med.dosageForm} • {med.strength}
                </span>
              </div>

              <div className="medicine-card-body">
                <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  {med.category?.name || 'General Health'}
                </div>
                <h3 className="medicine-title">{med.name}</h3>
                <div className="medicine-generic">{med.genericName}</div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.4 }}>
                  Mfr: <strong>{med.manufacturer}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700 }}>MRP Price</span>
                    <div className="medicine-price-tag">₹{med.price.toFixed(2)}</div>
                    <div style={{ fontSize: '0.72rem', color: med.totalStock > 0 ? '#059669' : '#dc2626', fontWeight: 700 }}>
                      {med.totalStock > 0 ? `In Stock (${med.totalStock} units)` : 'Out of Stock'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/medicines/${med._id}`} className="btn btn-outline btn-sm">
                      Details
                    </Link>
                    <button
                      onClick={() => handleAddToCart(med)}
                      className="btn btn-primary btn-sm"
                      disabled={med.totalStock === 0}
                    >
                      <Plus size={16} />
                      {med.totalStock === 0 ? 'Out of Stock' : 'Add'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default MedicineCatalogPage;

