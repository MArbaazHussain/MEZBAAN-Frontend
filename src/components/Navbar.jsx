import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePackage } from '../context/PackageContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { draft } = usePackage();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  const isStaff = user && (user.role === 'Admin' || user.role === 'Staff');

  // Global search bar (REQ-2.1) - har page par available
  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/services?search=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  };

  const close = () => setOpen(false);

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand" onClick={close}>MEZBAAN</Link>

        <form className="nav-search" onSubmit={onSearch}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search catering, decor, makeup..."
            aria-label="Search services"
          />
          <button type="submit">Search</button>
        </form>

        <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/services" onClick={close}>Services</NavLink>
          {(!user || user.role === 'Customer') && (
            <NavLink to="/package-builder" onClick={close}>
              My Package {draft.items.length > 0 && <span className="badge">{draft.items.length}</span>}
            </NavLink>
          )}
          {user?.role === 'Customer' && <NavLink to="/my-packages" onClick={close}>Saved Packages</NavLink>}
          {isStaff && <NavLink to="/admin/services" onClick={close}>Manage Services</NavLink>}
          {isStaff && <NavLink to="/admin/availability" onClick={close}>Availability</NavLink>}
          {isStaff && <NavLink to="/admin/inquiries" onClick={close}>Inquiries</NavLink>}
          {user?.role === 'Admin' && <NavLink to="/admin/users" onClick={close}>Users</NavLink>}

          {user ? (
            <>
              <NavLink to="/profile" onClick={close}>{user.fullName.split(' ')[0]} <small>({user.role})</small></NavLink>
              <button className="btn-link" onClick={() => { logout(); close(); navigate('/'); }}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>Login</NavLink>
              <Link to="/register" className="btn btn-gold btn-sm" onClick={close}>Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
