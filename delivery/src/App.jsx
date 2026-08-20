import { useState, useEffect } from 'react'
import Navbar from './components/Navbar/Navbar'

const App = () => {
  const [token, setToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('delivery_token', urlToken);
      window.history.replaceState({}, document.title, window.location.pathname);
      return urlToken;
    }
    return localStorage.getItem('delivery_token') || '';
  });

  const [profile, setProfile] = useState(null)
  const [incomingOrders, setIncomingOrders] = useState([])
  const [activeDeliveries, setActiveDeliveries] = useState([])
  const [historyDeliveries, setHistoryDeliveries] = useState([])
  
  const [activeTab, setActiveTab] = useState('home') // home, active, history, account
  const [selectedActiveIdx, setSelectedActiveIdx] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const url = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  // Fetch Delivery Partner profile details
  const fetchProfile = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${url}/api/user/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', token: token }
      });
      const result = await response.json();
      if (result.success) {
        setProfile(result.data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }

  // Fetch all orders lists (incoming, active, history)
  const fetchAllOrders = async (silent = false) => {
    if (!token) return;
    if (!silent) setIsLoading(true);
    setError('');
    try {
      // Incoming Orders
      const incomingRes = await fetch(`${url}/api/order/incoming`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', token: token }
      });
      const incomingData = await incomingRes.json();

      // Active Deliveries
      const activeRes = await fetch(`${url}/api/order/active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', token: token }
      });
      const activeData = await activeRes.json();

      // Delivery History
      const historyRes = await fetch(`${url}/api/order/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', token: token }
      });
      const historyData = await historyRes.json();

      if (incomingData.success) setIncomingOrders(incomingData.data || []);
      if (activeData.success) setActiveDeliveries(activeData.data || []);
      if (historyData.success) setHistoryDeliveries(historyData.data || []);

    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Unable to fetch orders. Please check backend connection.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }

  // Initial load and auto-polling
  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchAllOrders();
      
      const interval = setInterval(() => {
        fetchAllOrders(true);
      }, 5000); // Polling every 5 seconds for real-time updates

      return () => clearInterval(interval);
    }
  }, [token]);

  // Accept Order
  const acceptOrder = async (orderId) => {
    try {
      const response = await fetch(`${url}/api/order/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', token: token },
        body: JSON.stringify({ orderId })
      });
      const result = await response.json();
      if (result.success) {
        await fetchAllOrders(true);
        // Switch to active tab to show the accepted order
        setActiveTab('active');
        setSelectedActiveIdx(0);
      } else {
        alert(result.message || 'Failed to accept order.');
      }
    } catch (err) {
      console.error('Error accepting order:', err);
      alert('Error accepting order. Please try again.');
    }
  }

  // Decline Order
  const declineOrder = async (orderId) => {
    try {
      const response = await fetch(`${url}/api/order/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', token: token },
        body: JSON.stringify({ orderId })
      });
      const result = await response.json();
      if (result.success) {
        await fetchAllOrders(true);
      } else {
        alert(result.message || 'Failed to decline order.');
      }
    } catch (err) {
      console.error('Error declining order:', err);
      alert('Error declining order. Please try again.');
    }
  }

  // Advance delivery status
  const advanceStatus = async (orderId, currentStatus) => {
    let nextStatus = '';
    if (currentStatus === 'Accepted') {
      nextStatus = 'Preparing your food';
    } else if (currentStatus === 'Preparing your food') {
      nextStatus = 'Ready for pickup';
    } else if (currentStatus === 'Ready for pickup') {
      nextStatus = 'Out for Delivery';
    } else if (currentStatus === 'Out for Delivery') {
      nextStatus = 'Delivered';
    }

    if (!nextStatus) return;

    try {
      const response = await fetch(`${url}/api/order/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', token: token },
        body: JSON.stringify({ orderId, status: nextStatus })
      });
      const result = await response.json();
      if (result.success) {
        await fetchAllOrders(true);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status. Please try again.');
    }
  }

  // Sign out / Logout
  const handleLogout = () => {
    localStorage.removeItem('delivery_token');
    setToken('');
    setProfile(null);
  }

  // Unauthenticated screen
  if (!token) {
    return (
      <div className="auth-redirect-screen">
        <div className="auth-redirect-card">
          <div className="brand" style={{ justifyContent: 'center', marginBottom: '20px' }}>
            <span>F</span>
            <div>
              <strong style={{ display: 'inline-block' }}>FOODIO</strong>
              <small style={{ display: 'block', textAlign: 'left' }}>DELIVERY PARTNER</small>
            </div>
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Access Denied</h2>
          <p>Please log in as a <strong>Delivery Partner</strong> via the main application to view your dashboard.</p>
          <a href="http://localhost:5173" className="redirect-btn">Go to Customer Login</a>
        </div>
      </div>
    )
  }

  // Get selected active delivery detailed view
  const currentActiveDelivery = activeDeliveries[selectedActiveIdx] || activeDeliveries[0] || null;

  // Render stats
  const completedCount = historyDeliveries.length;
  const earnings = completedCount * 80; // ₹80 per completed delivery
  const acceptanceRate = 100; // Mocked rate

  return (
    <div className='delivery-app'>
      <Navbar 
        profile={profile} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        activeDeliveriesCount={activeDeliveries.length} 
      />

      <main>
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Syncing dashboard data...</p>
          </div>
        ) : (
          <>
            {/* 1. HOME / DASHBOARD TAB */}
            {activeTab === 'home' && (
              <div className="dashboard-grid">
                <section className='welcome'>
                  <div>
                    <p className='eyebrow'>Good afternoon, {profile?.name || 'Partner'}</p>
                    <h1>Let’s make some<br /><em>great deliveries.</em></h1>
                    <p>Track your schedule, accept incoming orders, and manage active deliveries.</p>
                  </div>
                  <div className='weather'>☀ <span>29°</span><small>Clear routes today</small></div>
                </section>

                <section className='metrics'>
                  <article>
                    <span>Today’s earnings</span>
                    <strong>₹{earnings}</strong>
                    <small>₹80 fee per delivery</small>
                  </article>
                  <article>
                    <span>Completed</span>
                    <strong>{completedCount}</strong>
                    <small>Deliveries completed</small>
                  </article>
                  <article>
                    <span>Acceptance rate</span>
                    <strong>{acceptanceRate}%</strong>
                    <small>Excellent standing</small>
                  </article>
                </section>

                {error && <div style={{ color: 'var(--red)', background: 'var(--red-light)', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>{error}</div>}

                {/* Incoming Orders Section */}
                <div>
                  <div className="section-title-bar">
                    <h2>Incoming / New Orders</h2>
                    <span>{incomingOrders.length} available</span>
                  </div>

                  {incomingOrders.length === 0 ? (
                    <div className="empty-state">
                      <div className="radar-search">
                        <div className="radar-ring"></div>
                        <div className="radar-ring"></div>
                        <div className="radar-ring"></div>
                        <div className="radar-dot"></div>
                      </div>
                      <h3>Searching for new orders</h3>
                      <p>Currently no incoming orders to deliver. We'll alert you as soon as a customer places an order.</p>
                    </div>
                  ) : (
                    <div className="incoming-grid">
                      {incomingOrders.map(order => {
                        const seed = order._id ? order._id.charCodeAt(order._id.length - 1) : 0;
                        const timeVal = new Date(order.date).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

                        return (
                          <div key={order._id} className="incoming-card">
                            <div className="card-header">
                              <div>
                                <p className="eyebrow" style={{ marginBottom: 0 }}>Order ID</p>
                                <h3>#FD-{order._id.substring(order._id.length - 4).toUpperCase()}</h3>
                              </div>
                              <span className="order-time">{timeVal}</span>
                            </div>

                            <ul className="order-details-list">
                              <li><strong>Customer:</strong> {order.address.firstName} {order.address.lastName}</li>
                              <li><strong>Contact:</strong> {order.address.phone}</li>
                              <li><strong>Address:</strong> {order.address.street}, {order.address.city}</li>
                              <li><strong>Total Value:</strong> ₹{order.amount} ({order.paymentMethod === 'cod' ? 'COD' : 'Paid Online'})</li>
                            </ul>

                            <div className="order-items-box">
                              <div><strong>Items Ordered:</strong></div>
                              {order.items.map((item, idx) => (
                                <div key={idx}>{item.quantity} × {item.name}</div>
                              ))}
                            </div>

                            <div className="incoming-card-footer">
                              <button onClick={() => declineOrder(order._id)} className="decline-btn">Decline</button>
                              <button onClick={() => acceptOrder(order._id)} className="accept-btn">Accept Order</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. ACTIVE DELIVERIES TAB */}
            {activeTab === 'active' && (
              <div>
                <div className="section-title-bar">
                  <h2>Active Deliveries</h2>
                  <span>{activeDeliveries.length} in progress</span>
                </div>

                {activeDeliveries.length === 0 ? (
                  <div className="empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13"></rect>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                      <circle cx="5.5" cy="18.5" r="2.5"></circle>
                      <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                    <h3>No Active Deliveries</h3>
                    <p>Accept an order from the dashboard to begin your delivery route.</p>
                  </div>
                ) : (
                  <div className="content-grid">
                    {/* Left: Map & Route View */}
                    {currentActiveDelivery && (
                      <div className="map">
                        <div className="map-lines"></div>
                        <div className="route first"></div>
                        <div className="route second"></div>
                        <span className="pin pickup">●<small>Pick-up</small></span>
                        <span className="pin drop">●<small>Drop-off</small></span>
                        <div className="map-note">
                          <small>Route ETA</small>
                          <strong>Foodio Kitchen</strong>
                          <span>12 min away</span>
                        </div>
                      </div>
                    )}

                    {/* Right: Selected Active Details & Status Advancer */}
                    {currentActiveDelivery && (
                      <aside className='active-card'>
                        <div className='card-top'>
                          <div>
                            <p className='eyebrow'>Current Delivery</p>
                            <h2>#FD-{currentActiveDelivery._id.substring(currentActiveDelivery._id.length - 4).toUpperCase()}</h2>
                          </div>
                          <span className={`status ${currentActiveDelivery.status.toLowerCase().replaceAll(' ', '-')}`}>
                            {currentActiveDelivery.status}
                          </span>
                        </div>

                        <div className='stop'>
                          <i className='orange'></i>
                          <div>
                            <small>Pick up from</small>
                            <strong>Foodio Kitchen</strong>
                            <p>Food counter · please verify items: {currentActiveDelivery.items.map(i => `${i.name} (${i.quantity})`).join(', ')}</p>
                          </div>
                        </div>

                        <div className='stop'>
                          <i className='green'></i>
                          <div>
                            <small>Deliver to</small>
                            <strong>{currentActiveDelivery.address.firstName} {currentActiveDelivery.address.lastName}</strong>
                            <p>{currentActiveDelivery.address.street}, {currentActiveDelivery.address.city}</p>
                            <p style={{ marginTop: '5px', fontSize: '0.78rem', color: 'var(--ink)' }}>Phone: {currentActiveDelivery.address.phone}</p>
                          </div>
                        </div>

                        <div className='actions'>
                          <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${currentActiveDelivery.address.street}, ${currentActiveDelivery.address.city}`)}`} 
                            target='_blank' 
                            rel='noreferrer'
                          >
                            Navigate ↗
                          </a>
                          
                          <button 
                            onClick={() => advanceStatus(currentActiveDelivery._id, currentActiveDelivery.status)}
                            disabled={currentActiveDelivery.status === 'Delivered'}
                          >
                            {currentActiveDelivery.status === 'Accepted' && 'Confirm Acceptance'}
                            {currentActiveDelivery.status === 'Preparing your food' && 'Food Ready for Pickup'}
                            {currentActiveDelivery.status === 'Ready for pickup' && 'Confirm Pick-up'}
                            {currentActiveDelivery.status === 'Out for Delivery' && 'Confirm Delivery'}
                          </button>
                        </div>
                      </aside>
                    )}

                    {/* Delivery Queue (Multiple Active) */}
                    {activeDeliveries.length > 1 && (
                      <section className='queue' style={{ gridColumn: 'span 2' }}>
                        <div className='queue-title'>
                          <div>
                            <p className='eyebrow'>Delivery Queue</p>
                            <h2>Your active deliveries</h2>
                          </div>
                          <span>{activeDeliveries.length} active</span>
                        </div>
                        {activeDeliveries.map((item, index) => (
                          <button 
                            key={item._id} 
                            onClick={() => setSelectedActiveIdx(index)} 
                            className={`queue-item ${selectedActiveIdx === index ? 'selected' : ''}`}
                          >
                            <b>{index + 1}</b>
                            <div>
                              <strong>Foodio Kitchen <small>#FD-{item._id.substring(item._id.length - 4).toUpperCase()}</small></strong>
                              <span>To: {item.address.firstName} {item.address.lastName} · Total: ₹{item.amount}</span>
                            </div>
                            <em>{item.status}</em>
                          </button>
                        ))}
                      </section>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. HISTORY TAB */}
            {activeTab === 'history' && (
              <div>
                <div className="section-title-bar">
                  <h2>Completed Deliveries History</h2>
                  <span>{historyDeliveries.length} deliveries</span>
                </div>

                {historyDeliveries.length === 0 ? (
                  <div className="empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3>No Completed Deliveries</h3>
                    <p>Once you deliver active orders, they will appear in your delivery history log.</p>
                  </div>
                ) : (
                  <div className="history-container">
                    <table className="history-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Delivery Address</th>
                          <th>Total Amount</th>
                          <th>Status</th>
                          <th>Completed Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyDeliveries.map(order => {
                          const dateVal = new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                          const timeVal = new Date(order.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

                          return (
                            <tr key={order._id}>
                              <td><strong>#FD-{order._id.substring(order._id.length - 4).toUpperCase()}</strong></td>
                              <td>{order.address.firstName} {order.address.lastName}</td>
                              <td>{order.address.street}, {order.address.city}</td>
                              <td>₹{order.amount}</td>
                              <td><span className="history-status-badge">Delivered</span></td>
                              <td>{dateVal} at {timeVal}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 4. ACCOUNT TAB */}
            {activeTab === 'account' && (
              <div>
                <div className="section-title-bar">
                  <h2>My Account Profile</h2>
                </div>

                <div className="profile-grid">
                  <div className="profile-card">
                    <div className="profile-avatar-large">
                      {profile?.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'RK'}
                    </div>
                    <div className="profile-name">{profile?.name || 'Rohan Kapoor'}</div>
                    <div className="profile-email">{profile?.email || 'rohan.kapoor@foodio.com'}</div>
                    <span className="role-badge">Delivery Partner</span>

                    <button onClick={handleLogout} className="logout-btn">Sign Out</button>
                  </div>

                  <div className="profile-stats-card">
                    <h3>Delivery Statistics</h3>
                    <div className="stat-rows">
                      <div className="stat-row">
                        <span>Total Deliveries Completed</span>
                        <strong>{completedCount}</strong>
                      </div>
                      <div className="stat-row">
                        <span>Current Day Earnings</span>
                        <strong>₹{earnings}</strong>
                      </div>
                      <div className="stat-row">
                        <span>Base Payout Rate</span>
                        <strong>₹80.00 / delivery</strong>
                      </div>
                      <div className="stat-row">
                        <span>Account Status</span>
                        <strong style={{ color: 'var(--green)' }}>Active & In Good Standing</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App;
