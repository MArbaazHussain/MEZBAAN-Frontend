import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [notVerified, setNotVerified] = useState(false);
  const [resendMsg, setResendMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setNotVerified(false);
    setResendMsg(null);
    if (!form.email || !form.password) return setError('Please enter both email and password.');
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      const fallback = user.role === 'Customer' ? '/services' : '/admin/services';
      navigate(location.state?.from || fallback, { replace: true });
    } catch (err) {
      setError(err.message);
      if (err.data?.code === 'EMAIL_NOT_VERIFIED') setNotVerified(true);
    } finally {
      setBusy(false);
    }
  };

  // Account not verified: link dobara bhejo (SRS 4.1 alternate flow)
  const resend = async () => {
    try {
      const d = await api('/auth/resend-verification', { method: 'POST', body: { email: form.email } });
      setResendMsg(d);
    } catch (err) {
      setResendMsg({ message: err.message, failed: true });
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1>Welcome back</h1>
        <p className="muted">Login to MEZBAAN</p>
        {location.state?.verified && <div className="alert alert-success">Your email is verified. You can now log in.</div>}
        {error && <div className="alert alert-error">{error}</div>}
        {notVerified && (
          <button type="button" className="btn btn-outline btn-block" onClick={resend}>Send verification link again</button>
        )}
        {resendMsg && (
          <div className={`alert ${resendMsg.failed ? 'alert-error' : 'alert-success'}`}>
            {resendMsg.message}
            {resendMsg.devVerificationLink && <><br /><a href={resendMsg.devVerificationLink}>Verify my email (development link)</a></>}
          </div>
        )}
        <label>Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
        </label>
        <label>Password
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" />
        </label>
        <button className="btn btn-dark btn-block" disabled={busy}>{busy ? 'Logging in...' : 'Login'}</button>
        <p className="muted center small">New here? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
