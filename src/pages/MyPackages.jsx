import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, formatPKR } from '../api';
import { usePackage } from '../context/PackageContext';

export default function MyPackages() {
  const [packages, setPackages] = useState(null);
  const [error, setError] = useState('');
  const { loadPackage } = usePackage();
  const navigate = useNavigate();
  const location = useLocation();

  const load = () => api('/packages', { auth: true }).then(setPackages).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const edit = (p) => { loadPackage(p); navigate('/package-builder'); };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.packageName}"?`)) return;
    try {
      await api(`/packages/${p._id}`, { method: 'DELETE' });
      load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div>
      <div className="page-head">
        <h1>My saved packages</h1>
        <Link to="/package-builder" className="btn btn-gold">+ New package</Link>
      </div>
      {location.state?.saved && <div className="alert alert-success">Package saved successfully!</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {packages === null && <p className="muted">Loading...</p>}
      {packages?.length === 0 && <div className="card center"><p className="muted">You have no saved packages yet.</p></div>}

      <div className="package-list">
        {packages?.map((p) => {
          const over = p.budgetLimit > 0 && p.estimatedTotal > p.budgetLimit;
          return (
            <div key={p._id} className="card package-card">
              <div className="package-top">
                <div>
                  <h3>{p.packageName}</h3>
                  <p className="muted small">
                    {p.eventType} · {p.guestCount} guests
                    {p.eventDate && ` · ${new Date(p.eventDate).toLocaleDateString('en-PK')}`}
                    {p.eventLocation && ` · ${p.eventLocation}`}
                  </p>
                </div>
                <span className={`pill pill-${p.packageStatus.toLowerCase()}`}>{p.packageStatus}</span>
              </div>
              <ul className="mini-list">
                {p.items.map((i) => (
                  <li key={i._id}><span>{i.serviceId?.title || 'Removed service'}</span><span>{formatPKR(i.lineTotal)}</span></li>
                ))}
              </ul>
              <div className="package-bottom">
                <div>
                  <strong>{formatPKR(p.estimatedTotal)}</strong>
                  {p.budgetLimit > 0 && (
                    <span className={`small ${over ? 'text-danger' : 'text-success'}`}> / budget {formatPKR(p.budgetLimit)} {over ? '(over)' : ''}</span>
                  )}
                </div>
                {p.packageStatus !== 'Converted' && (
                  <div className="actions">
                    <button className="btn btn-outline btn-sm" onClick={() => edit(p)}>Open / Edit</button>
                    <button className="btn-link text-danger" onClick={() => remove(p)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
