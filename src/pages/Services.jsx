import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, toQuery, EVENT_TYPES, UNIT_LABEL } from '../api';
import ServiceCard from '../components/ServiceCard';

const FILTER_KEYS = ['search', 'categoryId', 'businessId', 'minPrice', 'maxPrice', 'pricingUnit', 'eventType', 'guests', 'date', 'minRating', 'sort'];

// Global Search + Advanced Filters (SRS 4.2, 4.3)
export default function Services() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form ki values URL se aati hain, taake link share ho sake
  const current = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || '']));
  const [form, setForm] = useState(current);

  useEffect(() => {
    api('/services/categories').then(setCategories).catch(() => {});
    api('/services/businesses').then(setBusinesses).catch(() => {});
  }, []);

  useEffect(() => {
    setForm(current);
    setLoading(true);
    setError('');
    api(`/services${toQuery(current)}`)
      .then((d) => setServices(d.services))
      .catch((err) => { setError(err.message); setServices([]); })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  const apply = (e) => {
    e?.preventDefault();
    if (form.minPrice && form.maxPrice && Number(form.minPrice) > Number(form.maxPrice)) {
      setError('Minimum price cannot be greater than maximum price.');
      return;
    }
    if (form.date && form.date < new Date().toISOString().slice(0, 10)) {
      setError('Date cannot be in the past.');
      return;
    }
    const next = {};
    Object.entries(form).forEach(([k, v]) => { if (String(v).trim()) next[k] = v; });
    setParams(next);
  };

  const removeFilter = (k) => {
    const next = new URLSearchParams(params);
    next.delete(k);
    setParams(next);
  };

  const labelFor = (k, v) => {
    if (k === 'categoryId') return categories.find((c) => c._id === v)?.categoryName || 'Category';
    if (k === 'businessId') return businesses.find((b) => b._id === v)?.businessName || 'Business';
    if (k === 'pricingUnit') return UNIT_LABEL[v];
    if (k === 'minPrice') return `Min Rs. ${v}`;
    if (k === 'maxPrice') return `Max Rs. ${v}`;
    if (k === 'guests') return `${v} guests`;
    if (k === 'search') return `"${v}"`;
    if (k === 'date') return `Free on ${v}`;
    if (k === 'minRating') return `★ ${v}+`;
    return v;
  };

  const active = FILTER_KEYS.filter((k) => k !== 'sort' && current[k]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="catalog">
      <aside className="filters card">
        <form onSubmit={apply}>
          <h3>Filters</h3>
          <label>Keyword
            <input value={form.search} onChange={set('search')} placeholder="e.g. biryani, stage, car" />
          </label>
          <label>Service type
            <select value={form.categoryId} onChange={set('categoryId')}>
              <option value="">All</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.categoryName}</option>)}
            </select>
          </label>
          <label>Business
            <select value={form.businessId} onChange={set('businessId')}>
              <option value="">All</option>
              {businesses.map((b) => <option key={b._id} value={b._id}>{b.businessName}</option>)}
            </select>
          </label>
          <label>Event type
            <select value={form.eventType} onChange={set('eventType')}>
              <option value="">All</option>
              {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <div className="row-2">
            <label>Min price<input type="number" min="0" value={form.minPrice} onChange={set('minPrice')} /></label>
            <label>Max price<input type="number" min="0" value={form.maxPrice} onChange={set('maxPrice')} /></label>
          </div>
          <label>Pricing
            <select value={form.pricingUnit} onChange={set('pricingUnit')}>
              <option value="">Any</option>
              <option value="per_guest">Per guest</option>
              <option value="per_hour">Per hour</option>
              <option value="fixed_package">Fixed</option>
            </select>
          </label>
          <label>Guests<input type="number" min="1" value={form.guests} onChange={set('guests')} /></label>
          <label>Available on date<input type="date" min={today} value={form.date} onChange={set('date')} /></label>
          <label>Rating
            <select value={form.minRating} onChange={set('minRating')}>
              <option value="">Any</option>
              <option value="4">4 stars and up</option>
              <option value="3">3 stars and up</option>
              <option value="2">2 stars and up</option>
            </select>
            <span className="muted small" style={{ fontWeight: 400 }}>Services without ratings are hidden when this is used.</span>
          </label>
          <button className="btn btn-dark btn-block">Apply filters</button>
          {active.length > 0 && <button type="button" className="btn-link btn-block" onClick={() => setParams({})}>Clear all</button>}
        </form>
      </aside>

      <section className="results">
        <div className="results-head">
          <p><strong>{loading ? '...' : services.length}</strong> services found</p>
          <select value={current.sort} onChange={(e) => { const n = new URLSearchParams(params); e.target.value ? n.set('sort', e.target.value) : n.delete('sort'); setParams(n); }}>
            <option value="">Sort: Newest</option>
            <option value="price_asc">Price: Low to high</option>
            <option value="price_desc">Price: High to low</option>
            <option value="name">Name: A–Z</option>
            <option value="rating">Rating: High to low</option>
          </select>
        </div>

        {active.length > 0 && (
          <div className="chips">
            {active.map((k) => (
              <button key={k} className="chip" onClick={() => removeFilter(k)}>{labelFor(k, current[k])} ✕</button>
            ))}
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}
        {!loading && !error && services.length === 0 && (
          <div className="card center">
            <h3>{active.some((k) => k !== 'search') ? 'No services match these filters' : 'No services found'}</h3>
            <p className="muted">Try a different keyword, change the filters, or browse by category.</p>
            {active.length > 0 && <button className="btn btn-outline btn-sm" onClick={() => setParams({})}>Clear all filters</button>}
          </div>
        )}
        <div className="service-grid">
          {services.map((s) => <ServiceCard key={s._id} service={s} />)}
        </div>
      </section>
    </div>
  );
}
