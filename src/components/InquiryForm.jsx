import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Provider ko custom request bhejna (REQ-2.6)
export default function InquiryForm({ businessId, listingId, providerName }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', eventDate: '', message: '' });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const today = new Date().toISOString().slice(0, 10);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!form.message.trim()) return setMsg({ type: 'error', text: 'Please write your message before sending.' });
    if (!user) {
      if (!form.name.trim()) return setMsg({ type: 'error', text: 'Please enter your name.' });
      if (!EMAIL_RX.test(form.email)) return setMsg({ type: 'error', text: 'Please enter a valid email address.' });
    }
    setBusy(true);
    try {
      const body = { businessId, listingId, message: form.message, eventDate: form.eventDate || undefined };
      if (!user) Object.assign(body, { name: form.name, email: form.email });
      if (form.phone) body.phone = form.phone;
      const d = await api('/inquiries', { method: 'POST', body });
      setMsg({ type: 'success', text: d.message });
      setForm({ name: '', email: '', phone: '', eventDate: '', message: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message }); // jo likha tha wo form me rehta hai
    } finally {
      setBusy(false);
    }
  };

  if (user && user.role !== 'Customer') {
    return <p className="muted small">Inquiries are sent by customers. Staff can see them under Inquiries.</p>;
  }

  return (
    <form onSubmit={submit} noValidate>
      <h3>Send an inquiry{providerName ? ` to ${providerName}` : ''}</h3>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      {!user && (
        <div className="row-2">
          <label>Your name<input value={form.name} onChange={set('name')} autoComplete="name" /></label>
          <label>Email<input type="email" value={form.email} onChange={set('email')} autoComplete="email" /></label>
        </div>
      )}
      <div className="row-2">
        <label>Phone (optional)<input value={form.phone} onChange={set('phone')} autoComplete="tel" /></label>
        <label>Event date (optional)<input type="date" min={today} value={form.eventDate} onChange={set('eventDate')} /></label>
      </div>
      <label>Your request
        <textarea rows="4" maxLength="1000" value={form.message} onChange={set('message')} placeholder="e.g. Can you do a custom menu for 400 guests with a live BBQ counter?" />
      </label>
      <button className="btn btn-gold" disabled={busy}>{busy ? 'Sending...' : 'Send Inquiry'}</button>
    </form>
  );
}
