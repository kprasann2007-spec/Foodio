import React from 'react'
import './Account.css'

const Account = ({ profile, onLogout }) => {
  if (!profile) return null

  return (
    <div className='account add flex-col'>
      <div className="section-header">
        <p className="eyebrow">Settings</p>
        <h2>Restaurant Account</h2>
        <span>Manage your restaurant details and profile settings.</span>
      </div>

      <div className="account-grid">
        <div className="account-profile-card">
          <div className="avatar-large">
            {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'RT'}
          </div>
          <h3>{profile.restaurantName || profile.name}</h3>
          <p className="role-label">Registered Restaurant Owner</p>
          <span className="email-display">{profile.email}</span>

          <button onClick={onLogout} className="logout-btn-account">
            Sign Out of Account
          </button>
        </div>

        <div className="account-details-card">
          <h3>Restaurant Metadata</h3>
          <div className="details-list">
            <div className="detail-row">
              <span>Restaurant ID</span>
              <strong>{profile.id}</strong>
            </div>
            <div className="detail-row">
              <span>Restaurant Name</span>
              <strong>{profile.restaurantName || profile.name}</strong>
            </div>
            <div className="detail-row">
              <span>Associated Email</span>
              <strong>{profile.email}</strong>
            </div>
            <div className="detail-row">
              <span>Account Type</span>
              <strong>{profile.role.toUpperCase()}</strong>
            </div>
            <div className="detail-row">
              <span>Menu Status</span>
              <strong style={{ color: 'var(--green)' }}>Active & Live on Customer Dashboard</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Account
