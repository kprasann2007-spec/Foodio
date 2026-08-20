import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Add from './pages/Add/Add.jsx'
import List from './pages/List/List.jsx'
import Orders from './pages/Orders/Orders.jsx'
import PastOrders from './pages/PastOrders/PastOrders.jsx'
import Account from './pages/Account/Account.jsx'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000"

  const [token, setToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('restaurant_token', urlToken);
      window.history.replaceState({}, document.title, window.location.pathname);
      return urlToken;
    }
    return localStorage.getItem('restaurant_token') || '';
  });

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${url}/api/user/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', token: token }
      });
      const result = await response.json();
      if (result.success) {
        setProfile(result.data);
      } else {
        // Token might be invalid
        handleLogout();
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('restaurant_token');
    setToken('');
    setProfile(null);
  }

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  // Unauthenticated screen
  if (!token) {
    return (
      <div className="auth-redirect-screen">
        <ToastContainer />
        <div className="auth-redirect-card">
          <div className="brand" style={{ justifyContent: 'center', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'grid', width: '38px', height: '38px', placeItems: 'center', borderRadius: '12px',
              color: '#fff', backgroundColor: '#1e7149', fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: '700'
            }}>F</span>
            <div style={{ textAlign: 'left' }}>
              <strong style={{ display: 'inline-block', letterSpacing: '.09em', fontSize: '.95rem', color: '#17271d', fontWeight: '700' }}>FOODIO</strong>
              <small style={{ display: 'block', color: '#718076', fontSize: '.58rem', letterSpacing: '.13em' }}>RESTAURANT OWNER</small>
            </div>
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#17271d', fontFamily: 'Playfair Display, serif' }}>Access Denied</h2>
          <p style={{ color: '#718076', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
            Please log in as a <strong>Restaurant Owner</strong> via the customer application to access your management dashboard.
          </p>
          <a href="http://localhost:5173" style={{
            display: 'inline-block', padding: '12px 24px', backgroundColor: '#1e7149', color: '#fff',
            borderRadius: '25px', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '700', transition: 'background 0.2s'
          }}>Go to Customer Login</a>
        </div>
      </div>
    )
  }

  return (
    <div>
      <ToastContainer />
      <Navbar profile={profile} onLogout={handleLogout} />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard url={url} token={token} />} />
          <Route path="/add" element={<Add url={url} token={token} profile={profile} />} />
          <Route path="/list" element={<List url={url} token={token} />} />
          <Route path="/orders" element={<Orders url={url} token={token} />} />
          <Route path="/past-orders" element={<PastOrders url={url} token={token} />} />
          <Route path="/account" element={<Account profile={profile} onLogout={handleLogout} />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
