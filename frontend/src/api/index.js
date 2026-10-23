import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

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

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export default API;
