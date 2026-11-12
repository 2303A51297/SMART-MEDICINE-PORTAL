import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Shield,
  FileCheck,
  Eye,
  Plus
} from 'lucide-react';

const PrescriptionUploadPage = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientAge, setPatientAge] = useState('32');
  const [doctorName, setDoctorName] = useState('');
  const [hospitalOrClinic, setHospitalOrClinic] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get('/prescriptions/my');
      if (res.data.success) {
        setPrescriptions(res.data.prescriptions);
      }
    } catch (err) {
      console.error('Failed to load prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl('');
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a prescription document or image to upload');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('prescriptionFile', selectedFile);
      formData.append('patientName', patientName);
      formData.append('patientAge', patientAge);
      formData.append('doctorName', doctorName);
      formData.append('hospitalOrClinic', hospitalOrClinic);
      formData.append('notes', notes);

      const res = await api.post('/prescriptions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setSuccessMsg('Prescription uploaded successfully! It is now queued for licensed pharmacist review.');
        setSelectedFile(null);
        setPreviewUrl('');
        setDoctorName('');
        setNotes('');
        await fetchPrescriptions();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload prescription');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loader text="Loading prescription files..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Doctor Prescription Management</h1>
          <p className="page-subtitle">Upload medical prescriptions for pharmacist authorization and order clearance</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* Upload Form Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UploadCloud size={20} color="var(--primary)" />
            Upload New Doctor Prescription
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Ensure doctor's signature, date, clinic seal and prescribed medicines are clearly legible.
          </p>

          {successMsg && (
            <div style={{ padding: '0.75rem 1rem', background: '#dcfce7', border: '1px solid #86efac', color: '#065f46', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: 600 }}>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: 600 }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleUploadSubmit}>
            {/* File Dropzone */}
            <div style={{
              border: '2px dashed var(--border)',
              borderRadius: '12px',
              padding: '2rem 1rem',
              textAlign: 'center',
              background: '#f8fafc',
              cursor: 'pointer',
              marginBottom: '1.5rem',
              position: 'relative'
            }}>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
              />
              <UploadCloud size={36} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                {selectedFile ? selectedFile.name : 'Click to select or drag and drop prescription'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                Supports JPG, PNG, WEBP or PDF (Max 10MB)
              </div>
            </div>

            {/* Image Preview if image */}
            {previewUrl && (
              <div style={{ marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', maxHeight: '180px' }}>
                <img src={previewUrl} alt="Prescription Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f1f5f9' }} />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Patient Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Patient Age</label>
                <input
                  type="number"
                  className="form-control"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Doctor / Physician Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Dr. A. Sharma, MD"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Clinic / Hospital Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Apollo Super Specialty Clinic"
                value={hospitalOrClinic}
                onChange={(e) => setHospitalOrClinic(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Patient Notes / Specific Instructions</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="e.g. Need 10-day supply of antibiotic course..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={uploading}
            >
              {uploading ? 'Verifying & Submitting...' : 'Submit Prescription'}
            </button>
          </form>
        </div>

        {/* Guidelines & Compliance Advisory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#166534', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} /> Statutory Rx Verification Protocol
            </h3>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#15803d', lineHeight: 1.6 }}>
              <li>As per Drug and Cosmetics Rules, Schedule H & X medicines require an authorized registered medical practitioner's prescription.</li>
              <li>Our licensed on-duty pharmacists review each prescription against dosage and patient contraindications.</li>
              <li>Approvals are typically validated within 15–30 minutes during pharmacy business hours.</li>
            </ul>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Quick Status Indicator
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Badge status="pending" text="Pending" />
                <span style={{ color: 'var(--text-muted)' }}>Under review by on-duty pharmacist</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Badge status="approved" text="Approved" />
                <span style={{ color: 'var(--text-muted)' }}>Verified. Ready to attach to cart order</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Badge status="rejected" text="Rejected" />
                <span style={{ color: 'var(--text-muted)' }}>Invalid or expired. Review notes provided</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Customer's Uploaded Prescriptions History */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
          My Prescription Archive ({prescriptions.length})
        </h2>

        {prescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <FileText size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <div>No prescriptions uploaded yet. Use the form above to upload your first doctor prescription.</div>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Prescription Date</th>
                  <th>Patient</th>
                  <th>Doctor & Hospital</th>
                  <th>Status</th>
                  <th>Pharmacist Review Remarks</th>
                  <th>Valid Until</th>
                  <th>Document</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((p) => (
                  <tr key={p._id}>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      <strong>{p.patientName}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Age: {p.patientAge}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.doctorName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.hospitalOrClinic}</div>
                    </td>
                    <td>
                      <Badge status={p.status} />
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        {p.reviewNotes || (p.status === 'pending' ? 'Queued for verification' : 'None')}
                      </div>
                      {p.reviewedBy && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                          By: {p.reviewedBy.name}
                        </div>
                      )}
                    </td>
                    <td>
                      {p.validUntil ? new Date(p.validUntil).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <a
                        href={p.prescriptionFile}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                      >
                        <Eye size={14} /> View File
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default PrescriptionUploadPage;

