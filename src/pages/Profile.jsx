import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

// User Profile Management (REQ-1.9)
export default function Profile() {
  const { user, saveUser } = useAuth();
  const [form, setForm] = useState({ fullName: user.fullName, phoneNumber: user.phoneNumber || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [msg, setMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);

  const saveProfile = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const d = await api('/auth/profile', { method: 'PUT', body: form });
      saveUser(d.user);
      setMsg({ type: 'success', text: d.message });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (pw.newPassword !== pw.confirm) return setPwMsg({ type: 'error', text: 'New passwords do not match.' });
    try {
      const d = await api('/auth/change-password', { method: 'PUT', body: { currentPassword: pw.currentPassword, newPassword: pw.newPassword } });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwMsg({ type: 'success', text: d.message });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div>
      <h1>My profile</h1>
      <div className="two-col">
        <form className="card" onSubmit={saveProfile}>
          <h3>Personal details</h3>
          {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
          <label>Full name<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
          <label>Email<input value={user.email} disabled /></label>
          <label>Phone number<input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} /></label>
          <label>Role<input value={user.role} disabled /></label>
          <button className="btn btn-dark">Save changes</button>
        </form>

        <form className="card" onSubmit={changePassword}>
          <h3>Change password</h3>
          {pwMsg && <div className={`alert alert-${pwMsg.type}`}>{pwMsg.text}</div>}
          <label>Current password<input type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></label>
          <label>New password<input type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></label>
          <label>Confirm new password<input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></label>
          <p className="muted small">Min 8 characters with a letter and a number.</p>
          <button className="btn btn-outline">Update password</button>
        </form>
      </div>
    </div>
  );
}
