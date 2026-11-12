import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts & Guards
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import CustomerDashboard from './pages/customer/CustomerDashboard';
import MedicineCatalogPage from './pages/customer/MedicineCatalogPage';
import MedicineDetailPage from './pages/customer/MedicineDetailPage';
import PrescriptionUploadPage from './pages/customer/PrescriptionUploadPage';
import CartCheckoutPage from './pages/customer/CartCheckoutPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';

import PharmacistDashboard from './pages/pharmacist/PharmacistDashboard';
import InventoryManagementPage from './pages/pharmacist/InventoryManagementPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import CategoryManagementPage from './pages/admin/CategoryManagementPage';

import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import ReportsAnalyticsPage from './pages/reports/ReportsAnalyticsPage';

// Root Dispatcher based on Authenticated Role
const RoleBasedRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'pharmacist') return <Navigate to="/pharmacist/dashboard" replace />;
  if (user?.role === 'delivery') return <Navigate to="/delivery/dashboard" replace />;
  return <Navigate to="/customer/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Application Frame */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<RoleBasedRedirect />} />

                {/* Common/Customer Routes */}
                <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                <Route path="/medicines" element={<MedicineCatalogPage />} />
                <Route path="/medicines/:id" element={<MedicineDetailPage />} />
                <Route path="/prescriptions" element={<PrescriptionUploadPage />} />
                <Route path="/cart" element={<CartCheckoutPage />} />
                <Route path="/orders" element={<OrderHistoryPage />} />
                <Route path="/orders/:id/track" element={<OrderTrackingPage />} />

                {/* Pharmacist Specific */}
                <Route path="/pharmacist/dashboard" element={<PharmacistDashboard />} />
                <Route path="/pharmacist/inventory" element={<InventoryManagementPage />} />

                {/* Admin Specific */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/admin/categories" element={<CategoryManagementPage />} />

                {/* Delivery Specific */}
                <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />

                {/* Shared Reports (Admin & Pharmacist) */}
                <Route path="/reports" element={<ReportsAnalyticsPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

