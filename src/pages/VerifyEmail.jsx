import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';

// Email ke link se yahan aate hain: /verify-email?token=... (REQ-1.5)
export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', message: 'Verifying your email...' });
  const sent = useRef(false); // React StrictMode me effect do dafa chalta hai; request ek hi dafa jaye

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const token = params.get('token');
    if (!token) {
      setState({ status: 'error', message: 'Verification link is invalid.' });
      return;
    }
    api('/auth/verify-email', { method: 'POST', body: { token } })
      .then(() => navigate('/login', { replace: true, state: { verified: true } }))
      .catch((err) => setState({ status: 'error', message: err.message }));
  }, [params, navigate]);

  return (
    <div className="auth-wrap">
      <div className="card auth-card center">
        <h1>Email verification</h1>
        <div className={`alert ${state.status === 'error' ? 'alert-error' : 'alert-warn'}`}>{state.message}</div>
        {state.status === 'error' && (
          <p className="small">Go to <Link to="/login">login</Link> and use “Send verification link again”.</p>
        )}
      </div>
    </div>
  );
}
