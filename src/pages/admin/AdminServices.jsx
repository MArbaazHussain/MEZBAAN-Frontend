import { useEffect, useState } from 'react';
import { api, formatPKR, UNIT_LABEL, EVENT_TYPES } from '../../api';
import { useAuth } from '../../context/AuthContext';

const empty = {
  title: '', description: '', categoryId: '', businessId: '', basePrice: '', pricingUnit: 'fixed_package',
  minCapacity: 1, maxCapacity: '', eventTypes: [], imageUrl: '', imagesText: '', isPublished: true
};

// Service Catalog Management - Admin / Staff (CRUD)
export default function AdminServices() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState(null);
  const [filter, setFilter] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const load = () => api('/services/manage/all').then((d) => setServices(d.services)).catch((e) => setMsg({ type: 'error', text: e.message }));
  const loadCategories = () => api('/services/categories').then(setCategories).catch(() => {});

  useEffect(() => {
    load();
    loadCategories();
    api('/services/businesses').then(setBusinesses).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const toggleEventType = (t) => setForm((f) => ({
    ...f,
    eventTypes: f.eventTypes.includes(t) ? f.eventTypes.filter((x) => x !== t) : [...f.eventTypes, t]
  }));

  const openNew = () => { setForm(empty); setEditingId(null); setShowForm(true); setMsg(null); };

  const openEdit = (s) => {
    setForm({
      title: s.title, description: s.description || '', categoryId: s.categoryId?._id || '',
      businessId: s.businessId?._id || '', basePrice: s.basePrice, pricingUnit: s.pricingUnit,
      minCapacity: s.minCapacity ?? 1, maxCapacity: s.maxCapacity ?? '', eventTypes: s.eventTypes || [],
      imageUrl: s.imageUrl || '', imagesText: (s.images || []).join('\n'), isPublished: s.isPublished !== false
    });
    setEditingId(s._id);
    setShowForm(true);
    setMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!form.title.trim() || !form.categoryId || form.basePrice === '') {
      return setMsg({ type: 'error', text: 'Title, category and price are required.' });
    }
    if (Number(form.basePrice) < 0) return setMsg({ type: 'error', text: 'Price cannot be negative.' });

    const { imagesText, ...rest } = form;
    const body = {
      ...rest,
      imageUrl: rest.imageUrl.trim() || undefined,
      images: imagesText.split('\n').map((u) => u.trim()).filter(Boolean),
      basePrice: Number(form.basePrice),
      minCapacity: Number(form.minCapacity) || 1,
      maxCapacity: form.maxCapacity === '' ? undefined : Number(form.maxCapacity),
      businessId: form.businessId || undefined
    };
    try {
      if (editingId) await api(`/services/${editingId}`, { method: 'PUT', body });
      else await api('/services', { method: 'POST', body });
      setMsg({ type: 'success', text: editingId ? 'Service updated!' : 'Service created!' });
      setShowForm(false);
      setEditingId(null);
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const remove = async (s) => {
    if (!window.confirm(`Delete "${s.title}"?`)) return;
    try {
      await api(`/services/${s._id}`, { method: 'DELETE' });
      setMsg({ type: 'success', text: 'Service deleted.' });
      load();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
  };

  const togglePublish = async (s) => {
    try {
      await api(`/services/${s._id}`, { method: 'PUT', body: { isPublished: s.isPublished === false } });
      load();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await api('/services/categories', { method: 'POST', body: { categoryName: newCategory.trim() } });
      setNewCategory('');
      loadCategories();
      setMsg({ type: 'success', text: 'Category added.' });
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
  };

  const shown = services.filter((s) => !filter || s.categoryId?._id === filter);

  return (
    <div>
      <div className="page-head">
        <h1>Manage services</h1>
        <button className="btn btn-gold" onClick={openNew}>+ Add service</button>
      </div>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {showForm && (
        <form className="card" onSubmit={submit}>
          <h3>{editingId ? 'Edit service' : 'New service'}</h3>
          <div className="row-2">
            <label>Title *<input value={form.title} onChange={set('title')} /></label>
            <label>Image URL<input value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." /></label>
          </div>
          <label>Description<textarea rows="3" value={form.description} onChange={set('description')} /></label>
          <label>Gallery images (one link per line, up to 12)
            <textarea rows="3" value={form.imagesText} onChange={set('imagesText')} placeholder="https://..." />
          </label>
          <div className="row-3">
            <label>Category *
              <select value={form.categoryId} onChange={set('categoryId')}>
                <option value="">Select</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.categoryName}</option>)}
              </select>
            </label>
            <label>Business
              <select value={form.businessId} onChange={set('businessId')}>
                <option value="">Select</option>
                {businesses.map((b) => <option key={b._id} value={b._id}>{b.businessName}</option>)}
              </select>
            </label>
            <label>Pricing unit *
              <select value={form.pricingUnit} onChange={set('pricingUnit')}>
                <option value="per_guest">Per guest</option>
                <option value="per_hour">Per hour</option>
                <option value="fixed_package">Fixed</option>
              </select>
            </label>
          </div>
          <div className="row-3">
            <label>Price (Rs.) *<input type="number" min="0" value={form.basePrice} onChange={set('basePrice')} /></label>
            <label>Min capacity<input type="number" min="0" value={form.minCapacity} onChange={set('minCapacity')} /></label>
            <label>Max capacity<input type="number" min="0" value={form.maxCapacity} onChange={set('maxCapacity')} /></label>
          </div>
          <div className="check-group">
            <span>Event types:</span>
            {EVENT_TYPES.map((t) => (
              <label key={t} className="check"><input type="checkbox" checked={form.eventTypes.includes(t)} onChange={() => toggleEventType(t)} /> {t}</label>
            ))}
          </div>
          <label className="check"><input type="checkbox" checked={form.isPublished} onChange={set('isPublished')} /> Published (customers can see it)</label>
          <div className="actions">
            <button className="btn btn-dark">{editingId ? 'Update' : 'Create'}</button>
            <button type="button" className="btn-link" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="toolbar">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.categoryName}</option>)}
          </select>
          {user.role === 'Admin' && (
            <div className="inline-form">
              <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category name" />
              <button type="button" className="btn btn-outline btn-sm" onClick={addCategory}>Add category</button>
            </div>
          )}
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Service</th><th>Category</th><th>Business</th><th>Price</th><th>Status</th><th /></tr></thead>
            <tbody>
              {shown.map((s) => (
                <tr key={s._id}>
                  <td><strong>{s.title}</strong></td>
                  <td>{s.categoryId?.categoryName || '—'}</td>
                  <td>{s.businessId?.businessName || <span className="text-danger small">Not linked</span>}</td>
                  <td>{formatPKR(s.basePrice)} <span className="muted small">{UNIT_LABEL[s.pricingUnit]}</span></td>
                  <td>
                    <button className={`pill ${s.isPublished === false ? 'pill-draft' : 'pill-available'}`} onClick={() => togglePublish(s)} title="Click to toggle">
                      {s.isPublished === false ? 'Hidden' : 'Published'}
                    </button>
                  </td>
                  <td className="actions">
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edit</button>
                    {user.role === 'Admin' && <button className="btn-link text-danger" onClick={() => remove(s)}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
