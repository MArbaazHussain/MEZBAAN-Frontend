import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, formatPKR, UNIT_LABEL, EVENT_TYPES } from '../api';
import { usePackage } from '../context/PackageContext';
import { useAuth } from '../context/AuthContext';
import BudgetBar from '../components/BudgetBar';

// Build-Your-Own Package + Real-Time Price Calculator + Budget Tracker + Availability (SRS 4.4 - 4.7)
export default function PackageBuilder() {
  const { draft, removeService, setQuantity, updateField, clearDraft } = usePackage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [calc, setCalc] = useState(null);
  const [calcError, setCalcError] = useState('');
  const [avail, setAvail] = useState(null);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const itemsKey = JSON.stringify(draft.items.map((i) => [i.serviceId, i.quantity]));

  // Jab bhi service / quantity / guests / budget badle -> server se dobara total (REQ-5.1)
  useEffect(() => {
    if (draft.items.length === 0) { setCalc(null); return; }
    const t = setTimeout(() => {
      api('/packages/calculate', {
        method: 'POST',
        body: {
          guestCount: Number(draft.guestCount),
          budgetLimit: Number(draft.budgetLimit) || 0,
          items: draft.items.map((i) => ({ serviceId: i.serviceId, quantity: Number(i.quantity) }))
        }
      })
        .then((d) => { setCalc(d); setCalcError(''); })
        .catch((e) => setCalcError(e.message));
    }, 300);
    return () => clearTimeout(t);
  }, [itemsKey, draft.guestCount, draft.budgetLimit]);

  // Date ya services badlein to purana availability result hata do
  useEffect(() => { setAvail(null); }, [itemsKey, draft.eventDate]);

  const lineFor = (id) => calc?.lines.find((l) => String(l.serviceId) === id);

  const checkAvailability = async () => {
    try {
      const d = await api('/availability/check', {
        method: 'POST',
        body: { eventDate: draft.eventDate, serviceIds: draft.items.map((i) => i.serviceId) }
      });
      setAvail(d);
    } catch (e) {
      setAvail({ error: e.message });
    }
  };

  const save = async () => {
    setMsg(null);
    if (!user) return navigate('/login', { state: { from: '/package-builder' } });
    if (!draft.packageName.trim()) return setMsg({ type: 'error', text: 'Please give your package a name.' });
    setSaving(true);
    const body = {
      packageName: draft.packageName,
      eventType: draft.eventType,
      eventDate: draft.eventDate || undefined,
      eventLocation: draft.eventLocation,
      guestCount: Number(draft.guestCount),
      budgetLimit: Number(draft.budgetLimit) || 0,
      packageStatus: 'Saved',
      items: draft.items.map((i) => ({ serviceId: i.serviceId, quantity: Number(i.quantity) }))
    };
    try {
      if (draft.packageId) {
        await api(`/packages/${draft.packageId}`, { method: 'PUT', body });
      } else {
        await api('/packages', { method: 'POST', body });
      }
      clearDraft();
      navigate('/my-packages', { state: { saved: true } });
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (user && user.role !== 'Customer') {
    return <div className="card center"><h2>Package builder is for customers</h2><p className="muted">Aap {user.role} ke taur par logged in hain.</p></div>;
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <div className="page-head">
        <h1>{draft.packageId ? 'Edit package' : 'Build your package'}</h1>
        {draft.items.length > 0 && <button className="btn-link" onClick={clearDraft}>Start over</button>}
      </div>

      <div className="builder">
        <section className="card">
          <h3>Event details</h3>
          <div className="row-2">
            <label>Package name<input value={draft.packageName} onChange={(e) => updateField('packageName', e.target.value)} /></label>
            <label>Event type
              <select value={draft.eventType} onChange={(e) => updateField('eventType', e.target.value)}>
                {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
          </div>
          <div className="row-2">
            <label>Event date<input type="date" min={today} value={draft.eventDate} onChange={(e) => updateField('eventDate', e.target.value)} /></label>
            <label>Location<input value={draft.eventLocation} onChange={(e) => updateField('eventLocation', e.target.value)} placeholder="e.g. DHA, Karachi" /></label>
          </div>
          <div className="row-2">
            <label>Guests<input type="number" min="1" value={draft.guestCount} onChange={(e) => updateField('guestCount', e.target.value)} /></label>
            <label>Total budget (Rs.)<input type="number" min="0" value={draft.budgetLimit} onChange={(e) => updateField('budgetLimit', e.target.value)} /></label>
          </div>

          <h3 className="mt">Selected services</h3>
          {draft.items.length === 0 ? (
            <div className="empty">
              <p className="muted">No services added yet.</p>
              <Link to="/services" className="btn btn-gold">Browse services</Link>
            </div>
          ) : (
            <table className="table">
              <thead><tr><th>Service</th><th>Price</th><th>Qty / Hours</th><th className="right">Line total</th><th /></tr></thead>
              <tbody>
                {draft.items.map((i) => {
                  const line = lineFor(i.serviceId);
                  return (
                    <tr key={i.serviceId}>
                      <td><strong>{i.title}</strong><div className="muted small">{i.category}</div></td>
                      <td className="small">{formatPKR(i.basePrice)} {UNIT_LABEL[i.pricingUnit]}</td>
                      <td>
                        {i.pricingUnit === 'per_guest'
                          ? <span className="muted small">× {draft.guestCount} guests</span>
                          : <input className="qty" type="number" min="1" max="1000" value={i.quantity}
                              onChange={(e) => setQuantity(i.serviceId, e.target.value)} />}
                      </td>
                      <td className="right">{line ? formatPKR(line.lineTotal) : <span className="text-danger small">—</span>}</td>
                      <td><button className="btn-link text-danger" onClick={() => removeService(i.serviceId)}>Remove</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <Link to="/services" className="small">+ Add more services</Link>
        </section>

        <aside className="summary">
          <div className="card">
            <h3>Price summary</h3>
            {calcError && <div className="alert alert-error">{calcError}</div>}
            {calc?.errors?.length > 0 && (
              <div className="alert alert-warn">{calc.errors.map((e) => <div key={e}>{e}</div>)}</div>
            )}
            <div className="total">
              <span>Estimated total</span>
              <strong>{formatPKR(calc?.estimatedTotal || 0)}</strong>
            </div>
            <p className="muted small">Estimate only. Final price is confirmed in the quotation.</p>
            <hr />
            <h4>Budget tracker</h4>
            <BudgetBar status={calc?.budgetStatus} />
          </div>

          <div className="card">
            <h3>Availability</h3>
            <button className="btn btn-outline btn-block" disabled={!draft.eventDate || draft.items.length === 0} onClick={checkAvailability}>
              Check date for all services
            </button>
            {!draft.eventDate && <p className="muted small">Pehle event date select karein.</p>}
            {avail?.error && <div className="alert alert-error">{avail.error}</div>}
            {avail?.results && (
              <ul className="avail-list">
                {avail.results.map((r) => (
                  <li key={r.serviceId}>
                    <span>{r.title}</span>
                    <span className={`pill pill-${r.status.toLowerCase()}`}>{r.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
          <button className="btn btn-dark btn-block" disabled={saving || draft.items.length === 0 || (calc?.errors?.length > 0)} onClick={save}>
            {saving ? 'Saving...' : user ? (draft.packageId ? 'Update package' : 'Save package') : 'Login to save'}
          </button>
        </aside>
      </div>
    </div>
  );
}
