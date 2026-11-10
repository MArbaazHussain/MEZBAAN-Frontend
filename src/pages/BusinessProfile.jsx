import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import ServiceCard from '../components/ServiceCard';
import Gallery from '../components/Gallery';
import InquiryForm from '../components/InquiryForm';

// Provider profile page: gallery, description, contact, services, inquiry (REQ-2.5, REQ-2.6)
export default function BusinessProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    api(`/services/businesses/${id}`).then(setData).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="card center"><h2>Provider not found</h2><Link to="/services">Back to services</Link></div>;
  if (!data) return <p className="muted center">Loading...</p>;

  const { business, services, gallery } = data;

  return (
    <div>
      <Link to="/services" className="small">← Back to services</Link>
      <div className="detail-grid">
        <div className="card">
          <p className="eyebrow-dark">Provider</p>
          <h1>{business.businessName}</h1>
          {business.description && <p>{business.description}</p>}
          <Gallery images={gallery} />
        </div>
        <div className="card">
          <h3>Contact</h3>
          <ul className="facts">
            {business.contactPhone && <li><span>Phone</span><strong><a href={`tel:${business.contactPhone}`}>{business.contactPhone}</a></strong></li>}
            {business.contactEmail && <li><span>Email</span><strong><a href={`mailto:${business.contactEmail}`}>{business.contactEmail}</a></strong></li>}
            {business.address && <li><span>Address</span><strong>{business.address}</strong></li>}
            <li><span>Services</span><strong>{services.length}</strong></li>
          </ul>
        </div>
      </div>

      <section className="section">
        <h2 className="section-title">Services by {business.businessName}</h2>
        {services.length === 0
          ? <p className="muted">No published services yet.</p>
          : <div className="service-grid">{services.map((s) => <ServiceCard key={s._id} service={s} />)}</div>}
      </section>

      <section className="section card">
        <InquiryForm businessId={business._id} providerName={business.businessName} />
      </section>
    </div>
  );
}
