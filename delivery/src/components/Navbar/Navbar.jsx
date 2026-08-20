import React from 'react'
import './Navbar.css'

const Navbar = ({ profile, activeTab, setActiveTab, activeDeliveriesCount }) => {
  return (
    <header className="navbar">
      <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('home'); }} className="brand">
        <span>F</span>
        <div>
          <strong>FOODIO</strong>
          <small>DELIVERY PARTNER</small>
        </div>
      </a>

      <nav className="navbar-menu">
        <button onClick={() => setActiveTab('home')} className={`nav-tab-btn ${activeTab === 'home' ? 'active' : ''}`}>
          Home
        </button>
        <button onClick={() => setActiveTab('active')} className={`nav-tab-btn ${activeTab === 'active' ? 'active' : ''}`}>
          Active Deliveries ({activeDeliveriesCount})
        </button>
        <button onClick={() => setActiveTab('history')} className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}>
          History
        </button>
        <button onClick={() => setActiveTab('account')} className={`nav-tab-btn ${activeTab === 'account' ? 'active' : ''}`}>
          Account
        </button>
      </nav>

      <div className="navbar-right">
        <div className="online-indicator">
          <span className="online-dot"></span>
          <span>Online</span>
        </div>
        <button className="navbar-avatar" onClick={() => setActiveTab('account')}>
          {profile?.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'DP'}
        </button>
      </div>
    </header>
  )
}

export default Navbar
