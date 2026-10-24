import axios from 'axios';

/* ─────────────────────────────────────────────────────────────
   BACKEND URL
   1. REACT_APP_API_URL  (Netlify env variable / .env file)  – used first
   2. live build (npm run build)  → Render backend below
   3. local dev  (npm start)      → http://localhost:5000
   → a live site can NEVER fall back to localhost any more.
───────────────────────────────────────────────────────────── */
const LIVE_BACKEND = 'https://hilook-boutique.onrender.com';   // ← change if your Render URL is different
const clean = (u) => (u || '').trim().replace(/\/+$/, '');

export const API_URL =
  clean(process.env.REACT_APP_API_URL) ||
  (process.env.NODE_ENV === 'production' ? LIVE_BACKEND : 'http://localhost:5000');

const API = axios.create({ baseURL: API_URL, timeout: 60000 });   // 60s: Render free plan needs time to wake up

API.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

API.interceptors.response.use((r) => r, (err) => {
  const url = err.config?.url || '';
  // wrong password / wrong OTP also return 401 – don't kick the user out for those
  if (err.response?.status === 401 && !url.includes('/auth/')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return Promise.reject(err);
});

export default API;
