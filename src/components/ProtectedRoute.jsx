import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Sirf logged-in (aur sahi role wale) users ko page dikhao (REQ-1.8)
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="muted center">Loading...</p>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="card center">
        <h2>Access denied</h2>
        <p className="muted">Ye page aapke role ({user.role}) ke liye nahi hai.</p>
      </div>
    );
  }
  return children;
}
