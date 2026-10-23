import React, { createContext, useState, useContext } from 'react';
import API from '../api';

export const AuthContext = createContext({});

const errMsg = (e, fallback) => e.response?.data?.message || (e.code === 'ERR_NETWORK' ? 'Cannot reach the server. Is the backend running?' : fallback);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } });
  const [loading, setLoading] = useState(false);

  const saveSession = (data) => {
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
  };

  // wraps a request so every call has the same loading + error handling
  const call = async (fn, fallback) => {
    setLoading(true);
    try { return { ok: true, ...(await fn()) }; }
    catch (e) { const d = e.response?.data || {}; return { ok: false, msg: errMsg(e, fallback), ...d }; }
    finally { setLoading(false); }
  };

  /* REGISTER → OTP mailed */
  const register = (name, email, password, phone) =>
    call(async () => (await API.post('/api/auth/register', { name, email, password, phone })).data, 'Registration failed');

  /* REGISTER → verify OTP → logged in */
  const verifyRegisterOTP = (email, otp) =>
    call(async () => { const { data } = await API.post('/api/auth/verify-register', { email, otp }); saveSession(data); return { user: data.user }; }, 'Invalid OTP');

  /* CUSTOMER LOGIN step 1: email + password → OTP mailed */
  const loginStart = (email, password) =>
    call(async () => (await API.post('/api/auth/login', { email, password })).data, 'Login failed');

  /* CUSTOMER LOGIN step 2: OTP → logged in */
  const verifyLoginOTP = (email, otp) =>
    call(async () => { const { data } = await API.post('/api/auth/verify-otp', { email, otp }); saveSession(data); return { user: data.user }; }, 'Invalid OTP');

  const resendOTP = (email, purpose = 'login') =>
    call(async () => (await API.post('/api/auth/resend-otp', { email, purpose })).data, 'Failed to resend OTP');

  /* ADMIN LOGIN → straight to dashboard */
  const adminLogin = (email, password) =>
    call(async () => { const { data } = await API.post('/api/auth/admin-login', { email, password }); saveSession(data); return { user: data.user }; }, 'Invalid admin credentials');

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null);
    ['user', 'token', 'admin_auth'].forEach((k) => localStorage.removeItem(k));
  };

  return (
    <AuthContext.Provider value={{
      user, loading, isAdmin: user?.role === 'admin',
      register, verifyRegisterOTP, loginStart, verifyLoginOTP, resendOTP, adminLogin, updateUser, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
