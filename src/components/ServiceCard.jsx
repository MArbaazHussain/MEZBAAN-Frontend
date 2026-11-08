import { Link } from 'react-router-dom';
import { formatPKR, UNIT_LABEL } from '../api';
import { usePackage } from '../context/PackageContext';
import { useAuth } from '../context/AuthContext';

const ICONS = {
  Catering: '🍽️', Clothing: '👗', 'Beauty & Studio': '💄',
  Decoration: '🌸', Photography: '📷', Transportation: '🚗'
};

export default function ServiceCard({ service }) {
  const { addService, removeService, has } = usePackage();
  const { user } = useAuth();
  const category = service.categoryId?.categoryName || 'Service';
  const added = has(service._id);
  const canBuild = !user || user.role === 'Customer';

  return (
    <article className="service-card">
      <div className="service-img">
        {service.imageUrl
          ? <img src={service.imageUrl} alt={service.title} />
          : <span className="service-icon">{ICONS[category] || '✨'}</span>}
      </div>
      <div className="service-body">
        <div className="tags">
          <span className="tag">{category}</span>
          {service.businessId?.businessName && <span className="tag tag-light">{service.businessId.businessName}</span>}
        </div>
        <h3><Link to={`/services/${service._id}`}>{service.title}</Link></h3>
        <p className="muted clamp">{service.description}</p>
        <div className="service-foot">
          <div>
            <strong className="price">{formatPKR(service.basePrice)}</strong>
            <span className="muted small"> {UNIT_LABEL[service.pricingUnit]}</span>
          </div>
          {canBuild && (
            added
              ? <button className="btn btn-outline btn-sm" onClick={() => removeService(service._id)}>✓ Added</button>
              : <button className="btn btn-gold btn-sm" onClick={() => addService(service)}>+ Add</button>
          )}
        </div>
      </div>
    </article>
  );
}
