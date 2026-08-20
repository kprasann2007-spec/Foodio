import React, { useState, useEffect } from 'react'
import './Dashboard.css'
import axios from 'axios'

const Dashboard = ({ url, token }) => {
  const [stats, setStats] = useState({
    totalItems: 0,
    incomingOrders: 0,
    pastOrders: 0,
    todayOrders: 0,
    revenue: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    if (!token) return
    setLoading(true)
    try {
      // 1. Fetch food items for this restaurant
      const foodRes = await axios.get(`${url}/api/food/list`, { headers: { token } })
      const itemsCount = foodRes.data.success ? foodRes.data.data.length : 0

      // 2. Fetch incoming orders
      const incomingRes = await axios.post(`${url}/api/order/restaurant/incoming`, {}, { headers: { token } })
      const incomingList = incomingRes.data.success ? incomingRes.data.data : []

      // 3. Fetch past orders
      const pastRes = await axios.post(`${url}/api/order/restaurant/past`, {}, { headers: { token } })
      const pastList = pastRes.data.success ? pastRes.data.data : []

      // Calculate today's orders
      const allOrders = [...incomingList, ...pastList]
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)
      const todayCount = allOrders.filter(o => new Date(o.date) >= startOfDay).length

      // Calculate revenue
      const rev = pastList.reduce((acc, order) => acc + (order.amount || 0), 0)

      setStats({
        totalItems: itemsCount,
        incomingOrders: incomingList.length,
        pastOrders: pastList.length,
        todayOrders: todayCount,
        revenue: rev
      })

      // Take first 5 recent incoming orders
      setRecentOrders(incomingList.slice(0, 5))
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [token])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading restaurant dashboard analytics...</p>
      </div>
    )
  }

  return (
    <div className='dashboard add flex-col'>
      <div className="dashboard-header">
        <p className="eyebrow">Overview</p>
        <h2>Restaurant Analytics</h2>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <span>Total Food Items</span>
          <strong>{stats.totalItems}</strong>
          <small>Active in menu</small>
        </article>
        <article className="stat-card">
          <span>Incoming / Active Orders</span>
          <strong>{stats.incomingOrders}</strong>
          <small>Require preparation</small>
        </article>
        <article className="stat-card">
          <span>Completed Orders</span>
          <strong>{stats.pastOrders}</strong>
          <small>Processed history</small>
        </article>
        <article className="stat-card">
          <span>Today's Orders</span>
          <strong>{stats.todayOrders}</strong>
          <small>Orders placed today</small>
        </article>
        <article className="stat-card revenue">
          <span>Total Revenue</span>
          <strong>₹{stats.revenue}</strong>
          <small>From completed deliveries</small>
        </article>
      </div>

      <div className="recent-activity">
        <h3>Recent Incoming Orders</h3>
        {recentOrders.length === 0 ? (
          <div className="dashboard-empty-state">
            <p>No new orders require preparation right now.</p>
          </div>
        ) : (
          <div className="recent-orders-list">
            {recentOrders.map(order => (
              <div key={order._id} className="recent-order-item">
                <div className="order-brief">
                  <strong>#FD-{order._id.substring(order._id.length - 4).toUpperCase()}</strong>
                  <span>{order.address.firstName} {order.address.lastName}</span>
                </div>
                <div className="order-items-preview">
                  {order.items.map((it, idx) => (
                    <span key={idx}>{it.quantity} × {it.name}{idx < order.items.length - 1 ? ', ' : ''}</span>
                  ))}
                </div>
                <div className="order-value-status">
                  <strong>₹{order.amount}</strong>
                  <span className={`status-badge ${order.status.toLowerCase().replaceAll(' ', '-')}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
