import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="card center">
      <h1>Page not found</h1>
      <p className="muted">Ye page exist nahi karta.</p>
      <Link to="/" className="btn btn-gold">Go home</Link>
    </div>
  );
}
