import React, { useEffect, useState } from 'react'
import './Orders.css'
import { toast } from "react-toastify"
import axios from 'axios'
import { assets } from '../../assets/assets'

const Orders = ({ url, token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIncomingOrders = async () => {
    if (!token) return
    setLoading(true)
    try {
      const response = await axios.post(url + "/api/order/restaurant/incoming", {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.data || []);
      } else {
        toast.error(response.data.message || "Error fetching orders")
      }
    } catch (error) {
      console.error("Error fetching incoming orders:", error)
      toast.error("Could not fetch incoming orders")
    } finally {
      setLoading(false)
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(url + "/api/order/status", {
        orderId,
        status: event.target.value
      })
      if (response.data.success) {
        toast.success("Order status updated")
        await fetchIncomingOrders();
      } else {
        toast.error("Could not update order status")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Error updating order status")
    }
  }

  useEffect(() => {
    fetchIncomingOrders();
  }, [token])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading incoming orders...</p>
      </div>
    )
  }

  return (
    <div className='order add flex-col'>
      <div className="section-header">
        <p className="eyebrow">Incoming</p>
        <h2>Incoming Orders</h2>
        <span>Accept, prepare, and manage new orders from customers.</span>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state-card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <h3>No incoming orders right now</h3>
          <p>New customer orders containing your food items will appear here automatically.</p>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((order, index) => {
            const timeVal = new Date(order.date).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
            
            return (
              <div key={index} className="order-item">
                <img src={assets.parcel_icon} alt="Parcel" />
                <div className="order-item-content">
                  <div className="order-item-header">
                    <h4>#FD-{order._id.substring(order._id.length - 4).toUpperCase()}</h4>
                    <span className="order-item-time">{timeVal}</span>
                  </div>
                  
                  <p className="order-item-food">
                    {order.items.map((item, idx) => (
                      <span key={idx}>
                        {item.name} <strong>x {item.quantity}</strong>
                        {idx < order.items.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                  
                  <p className='order-item-name'>{order.address.firstName} {order.address.lastName}</p>
                  
                  <div className="order-item-address">
                    <p>{order.address.street}, </p>
                    <p>{order.address.city}, {order.address.state}, {order.address.country} - {order.address.zipCode}</p>
                  </div>
                  
                  <p className="order-item-phone">📞 {order.address.phone}</p>
                </div>
                
                <div className="order-item-right">
                  <p className="order-item-amount">₹{order.amount}</p>
                  <p className="payment-badge">{order.paymentMethod === 'cod' ? 'COD' : 'Paid'}</p>
                  
                  <div className="status-selector-container">
                    <select onChange={(event) => statusHandler(event, order._id)} value={order.status}>
                      <option value="Order Confirmed">Order Confirmed</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Preparing your food">Preparing your food</option>
                      <option value="Ready for pickup">Ready for pickup</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
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

export default Orders
