import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import ServiceCard from '../components/ServiceCard';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api('/services/categories').then(setCategories).catch(() => {});
    api('/services?sort=newest').then((d) => setFeatured(d.services.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Weddings · Mehndi · Walima · Birthdays · Corporate</p>
        <h1>Plan your whole event in one place</h1>
        <p className="hero-sub">
          Catering, dresses, makeup, decoration, photography and transport — build your own package,
          see the price instantly and stay within budget.
        </p>
        <form className="hero-search" onSubmit={(e) => { e.preventDefault(); navigate(`/services?search=${encodeURIComponent(q)}`); }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="What do you need? e.g. bridal makeup" />
          <button className="btn btn-gold">Search</button>
        </form>
        <div className="hero-actions">
          <Link to="/services" className="btn btn-outline-light">Browse services</Link>
          <Link to="/package-builder" className="btn btn-gold">Build your package</Link>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Browse by category</h2>
        <div className="category-grid">
          {categories.map((c) => (
            <Link key={c._id} to={`/services?categoryId=${c._id}`} className="category-tile">
              <strong>{c.categoryName}</strong>
              <span className="muted small">{c.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Popular services</h2>
          <Link to="/services">View all →</Link>
        </div>
        <div className="service-grid">
          {featured.map((s) => <ServiceCard key={s._id} service={s} />)}
        </div>
      </section>

      <section className="section steps">
        <div className="step"><span>1</span><h3>Pick services</h3><p className="muted">Search and filter across all businesses.</p></div>
        <div className="step"><span>2</span><h3>Build package</h3><p className="muted">Set guests and budget, see live total.</p></div>
        <div className="step"><span>3</span><h3>Check date</h3><p className="muted">See which services are free on your date.</p></div>
      </section>
    </>
  );
}
