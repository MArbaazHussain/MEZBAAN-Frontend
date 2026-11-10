import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import PackageBuilder from './pages/PackageBuilder';
import MyPackages from './pages/MyPackages';
import Profile from './pages/Profile';
import AdminServices from './pages/admin/AdminServices';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAvailability from './pages/admin/AdminAvailability';
import NotFound from './pages/NotFound';
import VerifyEmail from './pages/VerifyEmail';
import BusinessProfile from './pages/BusinessProfile';
import AdminInquiries from './pages/admin/AdminInquiries';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/businesses/:id" element={<BusinessProfile />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/package-builder" element={<PackageBuilder />} />

          {/* Logged in */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/my-packages" element={<ProtectedRoute roles={['Customer']}><MyPackages /></ProtectedRoute>} />

          {/* Admin / Staff */}
          <Route path="/admin/services" element={<ProtectedRoute roles={['Admin', 'Staff']}><AdminServices /></ProtectedRoute>} />
          <Route path="/admin/availability" element={<ProtectedRoute roles={['Admin', 'Staff']}><AdminAvailability /></ProtectedRoute>} />
          <Route path="/admin/inquiries" element={<ProtectedRoute roles={['Admin', 'Staff']}><AdminInquiries /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['Admin']}><AdminUsers /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">© 2026 MEZBAAN · Integrated Event &amp; Wedding Management Platform · SZABIST Karachi</footer>
    </>
  );
}
