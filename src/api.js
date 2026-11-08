// Saari backend API calls yahan se hoti hain
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getToken = () => localStorage.getItem('mezbaan_token');

// eslint-disable-next-line no-unused-vars
export async function api(path, { method = 'GET', body, auth } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`; // logged-in ho to har request ke saath token

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error('Server se connection nahi ho saka. Kya backend (npm run dev) chal raha hai?');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Query string banane ka helper: { search: 'a', minPrice: '' } -> "?search=a"
export const toQuery = (params) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') q.append(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : '';
};

export const formatPKR = (n) => `Rs. ${Number(n || 0).toLocaleString('en-PK')}`;

export const UNIT_LABEL = {
  per_guest: 'per guest',
  per_hour: 'per hour',
  fixed_package: 'fixed'
};

export const EVENT_TYPES = ['Wedding', 'Mehndi', 'Walima', 'Engagement', 'Birthday', 'Corporate'];
