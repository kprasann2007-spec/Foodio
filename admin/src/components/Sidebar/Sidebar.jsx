import React from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/' className="sidebar-option" end>
            <img src={assets.order_icon} alt="" style={{ transform: 'rotate(90deg)' }} />
            <p>Dashboard</p>
        </NavLink>
        <NavLink to='/add' className="sidebar-option">
            <img src={assets.add_icon} alt="" />
            <p>Add Items</p>
        </NavLink>
        <NavLink to='/list' className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>List Items</p>
        </NavLink>
        <NavLink to='/orders' className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>Incoming Orders</p>
        </NavLink>
        <NavLink to='/past-orders' className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>Past Orders</p>
        </NavLink>
        <NavLink to='/account' className="sidebar-option">
            <img src={assets.add_icon} alt="" />
            <p>Account</p>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar
