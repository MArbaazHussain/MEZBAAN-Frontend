import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASS_RX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const PHONE_RX = /^[0-9+\-\s]{10,15}$/;

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null); // register ke baad "check your email" screen

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Frontend validation (REQ-1.2, REQ-1.10). Phone optional hai (REQ-1.1)
  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Name is required.';
    if (!EMAIL_RX.test(form.email)) e.email = 'Please enter a valid email address.';
    if (form.phoneNumber && !PHONE_RX.test(form.phoneNumber)) e.phoneNumber = 'Enter a valid phone number (e.g. 03001234567).';
    if (!PASS_RX.test(form.password)) e.password = 'Min 8 characters with a letter and a number.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setBusy(true);
    try {
      const { confirm, ...body } = form;
      if (!body.phoneNumber) delete body.phoneNumber;
      const d = await register(body);
      setDone(d);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="auth-wrap">
        <div className="card auth-card">
          <h1>Check your email</h1>
          <p className="muted">
            We sent a verification link to <strong>{done.email}</strong>. Click the link to activate your account, then log in.
          </p>
          {done.devVerificationLink && (
            <div className="alert alert-warn">
              <strong>Development mode:</strong> email service is not set up yet, so here is the link:<br />
              <a href={done.devVerificationLink}>Verify my email</a>
            </div>
          )}
          <Link to="/login" className="btn btn-dark btn-block">Go to login</Link>
        </div>
      </div>
    );
  }

  const Field = ({ name, label, type = 'text', auto }) => (
    <label>{label}
      <input type={type} value={form[name]} onChange={set(name)} autoComplete={auto} className={errors[name] ? 'invalid' : ''} />
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </label>
  );

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1>Create account</h1>
        <p className="muted">Sign up as a customer to build and save packages</p>
        {serverError && <div className="alert alert-error">{serverError}</div>}
        {Field({ name: 'fullName', label: 'Full name', auto: 'name' })}
        {Field({ name: 'email', label: 'Email', type: 'email', auto: 'email' })}
        {Field({ name: 'phoneNumber', label: 'Phone number (optional)', auto: 'tel' })}
        {Field({ name: 'password', label: 'Password', type: 'password', auto: 'new-password' })}
        {Field({ name: 'confirm', label: 'Confirm password', type: 'password', auto: 'new-password' })}
        <button className="btn btn-dark btn-block" disabled={busy}>{busy ? 'Creating...' : 'Sign Up'}</button>
        <p className="muted center small">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}
