import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASS_RX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const PHONE_RX = /^[0-9+\-\s]{10,15}$/;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Frontend validation (REQ-1.2, REQ-1.10)
  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Name is required.';
    if (!EMAIL_RX.test(form.email)) e.email = 'Enter a valid email.';
    if (!PHONE_RX.test(form.phoneNumber)) e.phoneNumber = 'Enter a valid phone number (e.g. 03001234567).';
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
      await register(body);
      navigate('/services');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  };

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
        {Field({ name: 'phoneNumber', label: 'Phone number', auto: 'tel' })}
        {Field({ name: 'password', label: 'Password', type: 'password', auto: 'new-password' })}
        {Field({ name: 'confirm', label: 'Confirm password', type: 'password', auto: 'new-password' })}
        <button className="btn btn-dark btn-block" disabled={busy}>{busy ? 'Creating...' : 'Sign Up'}</button>
        <p className="muted center small">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}
