import { useEffect, useState } from 'react';
import { api } from '../../api';

// Staff / Admin: customers ki inquiries dekhna aur status badalna
export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [status, setStatus] = useState('');
  const [msg, setMsg] = useState(null);

  const load = () => api(`/inquiries${status ? `?status=${status}` : ''}`)
    .then(setInquiries)
    .catch((e) => setMsg({ type: 'error', text: e.message }));
  useEffect(() => { load(); }, [status]);

  const update = async (inq, inquiryStatus) => {
    try {
      await api(`/inquiries/${inq._id}`, { method: 'PATCH', body: { inquiryStatus } });
      load();
    } catch (e) { setMsg({ type: 'error', text: e.message }); }
  };

  const fmt = (d) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div>
      <h1>Inquiries</h1>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="card">
        <div className="toolbar">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option>New</option>
            <option>Replied</option>
            <option>Closed</option>
          </select>
          <span className="muted small">{inquiries.length} inquiries</span>
        </div>
        {inquiries.length === 0 && <p className="muted">No inquiries yet.</p>}
        <div className="inquiry-list">
          {inquiries.map((q) => (
            <div key={q._id} className="inquiry">
              <div className="package-top">
                <div>
                  <strong>{q.name}</strong> <span className="muted small">· {q.email}{q.phone ? ` · ${q.phone}` : ''}</span>
                  <div className="muted small">
                    To {q.businessId?.businessName || '—'}{q.listingId ? ` · ${q.listingId.title}` : ''} · {fmt(q.createdAt)}
                    {q.eventDate && ` · Event: ${fmt(q.eventDate)}`}
                  </div>
                </div>
                <select value={q.inquiryStatus} onChange={(e) => update(q, e.target.value)}>
                  <option>New</option>
                  <option>Replied</option>
                  <option>Closed</option>
                </select>
              </div>
              <p>{q.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
