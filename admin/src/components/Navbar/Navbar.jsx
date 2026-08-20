import React from 'react'
import './Navbar.css'
import { Link } from 'react-router-dom'

const Navbar = ({ profile, onLogout }) => {
  return (
    <div className='navbar'>
      <Link to="/" className="brand">
        <span>F</span>
        <div>
          <strong>FOODIO</strong>
          <small>RESTAURANT OWNER</small>
        </div>
      </Link>
      
      {profile && (
        <div className="navbar-right">
          <div className="navbar-profile-info">
            <strong className="navbar-restaurant-name">{profile.restaurantName || profile.name}</strong>
            <span className="navbar-restaurant-email">{profile.email}</span>
          </div>
          <button onClick={onLogout} className="navbar-logout-btn">
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default Navbar
