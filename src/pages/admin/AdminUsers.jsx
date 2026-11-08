import { useEffect, useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';

// Admin: Staff accounts banana aur users suspend/activate karna
export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '', role: 'Staff' });
  const [msg, setMsg] = useState(null);

  const load = () => api(`/auth/users${role ? `?role=${role}` : ''}`).then((d) => setUsers(d.users)).catch((e) => setMsg({ type: 'error', text: e.message }));
  useEffect(() => { load(); }, [role]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const d = await api('/auth/users', { method: 'POST', body: form });
      setMsg({ type: 'success', text: d.message });
      setForm({ fullName: '', email: '', phoneNumber: '', password: '', role: 'Staff' });
      load();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
  };

  const toggle = async (u) => {
    const accountStatus = u.accountStatus === 'Suspended' ? 'Active' : 'Suspended';
    try {
      await api(`/auth/users/${u.id}/status`, { method: 'PATCH', body: { accountStatus } });
      load();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
  };

  return (
    <div>
      <h1>Users &amp; staff</h1>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <form className="card" onSubmit={create}>
        <h3>Create staff account</h3>
        <div className="row-3">
          <label>Full name<input value={form.fullName} onChange={set('fullName')} /></label>
          <label>Email<input type="email" value={form.email} onChange={set('email')} /></label>
          <label>Phone<input value={form.phoneNumber} onChange={set('phoneNumber')} /></label>
        </div>
        <div className="row-3">
          <label>Password<input type="password" value={form.password} onChange={set('password')} /></label>
          <label>Role
            <select value={form.role} onChange={set('role')}>
              <option>Staff</option>
              <option>Admin</option>
            </select>
          </label>
          <div className="align-end"><button className="btn btn-dark btn-block">Create</button></div>
        </div>
      </form>

      <div className="card">
        <div className="toolbar">
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All roles</option>
            <option>Customer</option>
            <option>Staff</option>
            <option>Admin</option>
          </select>
          <span className="muted small">{users.length} users</span>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th /></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.phoneNumber}</td>
                  <td>{u.role}</td>
                  <td><span className={`pill ${u.accountStatus === 'Suspended' ? 'pill-unavailable' : 'pill-available'}`}>{u.accountStatus || 'Active'}</span></td>
                  <td>
                    {u.id !== me.id && (
                      <button className="btn-link" onClick={() => toggle(u)}>
                        {u.accountStatus === 'Suspended' ? 'Activate' : 'Suspend'}
                      </button>
                    )}
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
