import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, formatPKR, UNIT_LABEL } from '../api';
import { usePackage } from '../context/PackageContext';
import { useAuth } from '../context/AuthContext';
import Gallery from '../components/Gallery';
import InquiryForm from '../components/InquiryForm';

export default function ServiceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addService, removeService, has } = usePackage();
  const [service, setService] = useState(null);
  const [error, setError] = useState('');
  const [date, setDate] = useState('');
  const [avail, setAvail] = useState(null);

  useEffect(() => {
    api(`/services/${id}`).then(setService).catch((e) => setError(e.message));
  }, [id]);

  const check = async () => {
    setAvail(null);
    try {
      const d = await api('/availability/check', { method: 'POST', body: { eventDate: date, serviceIds: [id] } });
      setAvail(d.results[0]);
    } catch (e) {
      setAvail({ status: 'Error', message: e.message });
    }
  };

  if (error) return <div className="card center"><h2>Service not found</h2><Link to="/services">Back to services</Link></div>;
  if (!service) return <p className="muted center">Loading...</p>;

  const canBuild = !user || user.role === 'Customer';
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="detail">
      <Link to="/services" className="small">← Back to services</Link>
      <div className="detail-grid">
        <div className="card">
          <div className="tags">
            <span className="tag">{service.categoryId?.categoryName}</span>
            {service.businessId?.businessName && <span className="tag tag-light">{service.businessId.businessName}</span>}
          </div>
          <h1>{service.title}</h1>
          <Gallery images={[service.imageUrl, ...(service.images || [])].filter(Boolean).map((url) => ({ url, title: service.title }))} />
          <p>{service.description}</p>
          <ul className="facts">
            <li><span>Price</span><strong>{formatPKR(service.basePrice)} {UNIT_LABEL[service.pricingUnit]}</strong></li>
            {service.pricingUnit === 'per_guest' && (
              <li><span>Guests</span><strong>{service.minCapacity || 1} – {service.maxCapacity || 'any'}</strong></li>
            )}
            {service.eventTypes?.length > 0 && <li><span>Suitable for</span><strong>{service.eventTypes.join(', ')}</strong></li>}
            <li><span>Rating</span><strong>{service.averageRating ? `★ ${service.averageRating.toFixed(1)} (${service.ratingCount})` : 'No ratings yet'}</strong></li>
          </ul>
          {canBuild && (
            has(service._id)
              ? <button className="btn btn-outline" onClick={() => removeService(service._id)}>✓ In your package (remove)</button>
              : <button className="btn btn-gold" onClick={() => addService(service)}>+ Add to my package</button>
          )}
        </div>

        <div className="card">
          <h3>Check availability</h3>
          <label>Event date<input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <button className="btn btn-dark btn-block" disabled={!date} onClick={check}>Check</button>
          {avail && (
            <div className={`alert ${avail.status === 'Available' ? 'alert-success' : avail.status === 'Unconfirmed' ? 'alert-warn' : 'alert-error'}`}>
              <strong>{avail.status}</strong> — {avail.message}
            </div>
          )}
          <p className="muted small">Available result is not a reservation. Date is confirmed after booking approval.</p>

          {service.businessId && (
            <>
              <hr />
              <h3>Provider</h3>
              <p><strong>{service.businessId.businessName}</strong></p>
              {service.businessId.contactPhone && <p className="small">Phone: <a href={`tel:${service.businessId.contactPhone}`}>{service.businessId.contactPhone}</a></p>}
              {service.businessId.contactEmail && <p className="small">Email: <a href={`mailto:${service.businessId.contactEmail}`}>{service.businessId.contactEmail}</a></p>}
              <Link to={`/businesses/${service.businessId._id}`} className="btn btn-outline btn-block">View provider profile</Link>
            </>
          )}
        </div>
      </div>

      {service.businessId && (
        <section className="section card">
          <InquiryForm businessId={service.businessId._id} listingId={service._id} providerName={service.businessId.businessName} />
        </section>
      )}
    </div>
  );
}
