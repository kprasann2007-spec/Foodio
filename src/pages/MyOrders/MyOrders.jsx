import React, { useContext, useEffect, useState } from "react";
import './MyOrders.css'
import { StoreContext } from "../../context/StoreContext";
import { assets } from "../../assets/assets";
import axios from 'axios'

const trackingSteps = [
  {
    name: 'Order Confirmed',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    )
  },
  {
    name: 'Accepted',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    )
  },
  {
    name: 'Preparing your food',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h20"></path>
        <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"></path>
        <path d="M12 2v10"></path>
        <path d="M12 2a3 3 0 0 0-3 3"></path>
        <path d="M12 2a3 3 0 0 1 3 3"></path>
      </svg>
    )
  },
  {
    name: 'Ready for pickup',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
    )
  },
  {
    name: 'Out for Delivery',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
    )
  },
  {
    name: 'Delivered',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    )
  }
]

const trackingStepNames = trackingSteps.map(step => step.name)
const legacyStatus = { 'Food Processing': 'Preparing your food', 'Order placed (Cash on Delivery)': 'Order Confirmed' }

const MyOrders = () => {
  const { url, token } = useContext(StoreContext)
  const [data, setData] = useState([])
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchOrders = async () => {
    try {
      const response = await axios.post(`${url}/api/order/userorders`, {}, { headers: { token } })
      if (response.data.success) setData(response.data.data)
    } catch (error) {
      console.error('Unable to refresh order tracking', error)
    }
  }

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await fetchOrders()
    setTimeout(() => setIsRefreshing(false), 800)
  }

  useEffect(() => {
    if (!token) return undefined
    fetchOrders()
    const refreshInterval = setInterval(fetchOrders, 15000)
    return () => clearInterval(refreshInterval)
  }, [token])

  const activeOrders = data.filter((order) => {
    const currentStatus = legacyStatus[order.status] || order.status
    return currentStatus !== 'Delivered'
  })

  const pastOrders = data.filter((order) => {
    const currentStatus = legacyStatus[order.status] || order.status
    return currentStatus === 'Delivered'
  })

  const renderOrderList = (ordersList) => {
    if (ordersList.length === 0) {
      return <p className="empty-orders-message">No orders found in this section.</p>
    }

    return (
      <div className="containers">
        {ordersList.map((order) => {
          const currentStatus = legacyStatus[order.status] || order.status
          const currentStep = Math.max(0, trackingStepNames.indexOf(currentStatus))
          const isExpanded = expandedOrder === order._id
          const history = (order.statusHistory || []).map((entry) => ({ ...entry, status: legacyStatus[entry.status] || entry.status }))
          return (
            <article key={order._id} className="my-orders-orders">
              <div className="order-summary">
                <img src={assets.parcel_icon} alt="Order parcel" />
                <p>{order.items.map((item, index) => `${item.name} × ${item.quantity}${index === order.items.length - 1 ? '' : ', '}`)}</p>
                <p>₹{order.amount}</p>
                <p>Items: {order.items.length}</p>
                <p className="order-status"><span></span><b>{currentStatus}</b></p>
                <button type="button" onClick={() => setExpandedOrder(isExpanded ? null : order._id)}>{isExpanded ? 'Hide tracking' : 'Track order'}</button>
              </div>
              {isExpanded && <div className="order-tracking" aria-live="polite">
                <p className="tracking-title">Live order tracking</p>
                <ol>
                  {trackingSteps.map((step, index) => {
                    const update = history.filter((entry) => entry.status === step.name).at(-1)
                    const isComplete = index < currentStep
                    const isActive = index === currentStep
                    return <li key={step.name} className={isComplete ? 'complete' : isActive ? 'active' : ''}>
                      <span className="tracking-marker">
                        {isComplete ? '✓' : step.icon}
                      </span>
                      <div><b>{step.name}</b>{update?.updatedAt && <small>{new Date(update.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</small>}</div>
                    </li>
                  })}
                </ol>
              </div>}
            </article>
          )
        })}
      </div>
    )
  }

  return (
    <div className="my-orders">
      <div className="my-orders-heading">
        <div>
          <h2>My Orders</h2>
          <div className="live-updates-container">
            <p><span className="live-dot"></span> Live updates refresh every 15 seconds</p>
            <button 
              type="button" 
              className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              aria-label="Refresh orders"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>Refresh Now</span>
            </button>
          </div>
        </div>
      </div>
      
      {renderOrderList(activeOrders)}

      <div className="my-orders-heading past-orders-heading-container">
        <div>
          <h2 className="past-orders-heading">Past Orders</h2>
          <p>Orders that have been successfully delivered to you.</p>
        </div>
      </div>

      {renderOrderList(pastOrders)}
    </div>
  )
}

export default MyOrders
