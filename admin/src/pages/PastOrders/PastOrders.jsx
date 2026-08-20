import React, { useState, useEffect } from 'react'
import './PastOrders.css'
import axios from 'axios'

const PastOrders = ({ url, token }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPastOrders = async () => {
    if (!token) return
    setLoading(true)
    try {
      const response = await axios.post(`${url}/api/order/restaurant/past`, {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.data || [])
      }
    } catch (error) {
      console.error("Error fetching past orders:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPastOrders()
  }, [token])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading past orders history...</p>
      </div>
    )
  }

  return (
    <div className='past-orders add flex-col'>
      <div className="section-header">
        <p className="eyebrow">History</p>
        <h2>Past Orders</h2>
        <span>Orders that have been picked up or successfully delivered.</span>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state-card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="M16 13H8"></path>
            <path d="M16 17H8"></path>
            <path d="M10 9H9H8"></path>
          </svg>
          <h3>No past orders yet</h3>
          <p>Orders that are picked up by the delivery partner will move here from incoming orders.</p>
        </div>
      ) : (
        <div className="orders-container">
          {orders.map((order) => {
            const timeVal = new Date(order.date).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })

            return (
              <div key={order._id} className="past-order-card">
                <div className="card-top">
                  <div>
                    <span className="order-id-label">Order ID</span>
                    <h4>#FD-{order._id.substring(order._id.length - 4).toUpperCase()}</h4>
                  </div>
                  <span className={`status-pill ${order.status.toLowerCase().replaceAll(' ', '-')}`}>
                    {order.status}
                  </span>
                </div>

                <div className="customer-info-box">
                  <p><strong>Customer:</strong> {order.address.firstName} {order.address.lastName}</p>
                  <p><strong>Delivery Address:</strong> {order.address.street}, {order.address.city}</p>
                  <p><strong>Date & Time:</strong> {timeVal}</p>
                </div>

                <div className="order-items-detail">
                  <p className="sub-title">Items Ordered</p>
                  {order.items.map((item, index) => (
                    <div key={index} className="item-row">
                      <span>{item.quantity} × {item.name}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="card-footer">
                  <div className="payment-info">
                    <span>Payment Method: <strong>{order.paymentMethod === 'cod' ? 'COD' : 'Paid Online'}</strong></span>
                  </div>
                  <div className="order-total-price">
                    <span>Subtotal:</span>
                    <strong>₹{order.amount - 20}</strong>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PastOrders
