import { useState, useEffect } from 'react'

const initialDeliveries = [
  { id: '#FD-1081', restaurant: 'Green Garden Kitchen', customer: 'Maya Kapoor', address: '18 Lake View Road, Indiranagar', eta: '12 min away', status: 'Pick up order' },
  { id: '#FD-1076', restaurant: 'Spice House', customer: 'Ishaan Mehta', address: '42 Brigade Road, Ashok Nagar', eta: '18 min away', status: 'Out for delivery' },
  { id: '#FD-1072', restaurant: 'Wok & Grill', customer: 'Ananya Rao', address: '7 CMH Road, Indiranagar', eta: '23 min away', status: 'Assigned' }
]

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

  const [deliveries, setDeliveries] = useState([])
  const [active, setActive] = useState(0)
  const url = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  const fetchOrders = async () => {
    try {
      let endpoint = `${url}/api/order/list`;
      let headers = {};

      if (token) {
        endpoint = `${url}/api/order/userorders`;
        headers = { 'Content-Type': 'application/json', token: token };
      }

      const response = await fetch(endpoint, {
        method: token ? 'POST' : 'GET',
        headers: headers,
        body: token ? JSON.stringify({}) : undefined
      })
      const result = await response.json()
      if (result.success && result.data && result.data.length > 0) {
        const mapped = result.data.map(order => {
          let statusVal = 'Assigned';
          if (order.status === 'Ready for pickup') {
            statusVal = 'Pick up order';
          } else if (order.status === 'Out for Delivery') {
            statusVal = 'Out for delivery';
          } else if (order.status === 'Delivered') {
            statusVal = 'Delivered';
          }

          const seed = order._id ? order._id.charCodeAt(order._id.length - 1) : 0;
          const etaVal = `${(seed % 15) + 10} min away`;

          return {
            dbId: order._id,
            id: `#FD-${order._id.substring(order._id.length - 4).toUpperCase()}`,
            restaurant: 'Foodio Kitchen',
            customer: `${order.address.firstName} ${order.address.lastName}`,
            address: `${order.address.street}, ${order.address.city}`,
            eta: etaVal,
            status: statusVal
          };
        });
        setDeliveries(mapped);
      } else {
        setDeliveries(initialDeliveries);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setDeliveries(initialDeliveries);
    }
  }

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const delivery = deliveries[active] || deliveries[0] || initialDeliveries[0];

  const advance = async () => {
    if (!delivery) return;

    if (!delivery.dbId) {
      setDeliveries(items => items.map((item, index) => index === active ? { ...item, status: item.status === 'Pick up order' ? 'Out for delivery' : item.status === 'Out for delivery' ? 'Delivered' : 'Pick up order' } : item))
      return;
    }

    let nextStatus = '';
    if (delivery.status === 'Assigned') {
      nextStatus = 'Ready for pickup';
    } else if (delivery.status === 'Pick up order') {
      nextStatus = 'Out for Delivery';
    } else if (delivery.status === 'Out for delivery') {
      nextStatus = 'Delivered';
    }

    if (!nextStatus) return;

    try {
      const response = await fetch(`${url}/api/order/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: delivery.dbId, status: nextStatus })
      });
      const result = await response.json();
      if (result.success) {
        await fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  }

  const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.address)}`

  return <div className='delivery-app'>
    <header><div className='brand'><span>F</span><strong>FOODIO <small>DELIVERY</small></strong></div><div className='online'><i></i> Online</div><button className='avatar'>RK</button></header>
    <main><section className='welcome'><div><p className='eyebrow'>Good afternoon, Rohan</p><h1>Let’s make some<br /><em>great deliveries.</em></h1><p>Everything you need for today’s route is right here.</p></div><div className='weather'>☀ <span>29°</span><small>Clear routes today</small></div></section>
      <section className='metrics'><article><span>Today’s earnings</span><strong>₹1,240</strong><small>↑ ₹180 vs. yesterday</small></article><article><span>Completed</span><strong>6</strong><small>Deliveries today</small></article><article><span>Acceptance rate</span><strong>96%</strong><small>Excellent standing</small></article></section>
      <section className='content-grid'><div className='map'><div className='map-lines'></div><div className='route first'></div><div className='route second'></div><span className='pin pickup'>●<small>Pick-up</small></span><span className='pin drop'>●<small>Drop-off</small></span><div className='map-note'><small>Current route</small><strong>{delivery.restaurant}</strong><span>{delivery.eta}</span></div></div><aside className='active-card'><div className='card-top'><div><p className='eyebrow'>Current task</p><h2>{delivery.id}</h2></div><span className={`status ${delivery.status.toLowerCase().replaceAll(' ', '-')}`}>{delivery.status}</span></div><div className='stop'><i className='orange'></i><div><small>Pick up from</small><strong>{delivery.restaurant}</strong><p>Food counter · please verify order</p></div></div><div className='stop'><i className='green'></i><div><small>Deliver to</small><strong>{delivery.customer}</strong><p>{delivery.address}</p></div></div><div className='actions'><a href={mapUrl} target='_blank' rel='noreferrer'>Navigate ↗</a><button onClick={advance} disabled={delivery.status === 'Delivered'}>{delivery.status === 'Pick up order' ? 'Confirm pick-up' : delivery.status === 'Out for delivery' ? 'Confirm delivery' : delivery.status === 'Delivered' ? 'Completed' : 'Start pick-up'}</button></div></aside></section>
      <section className='queue'><div className='queue-title'><div><p className='eyebrow'>Delivery queue</p><h2>Your assigned orders</h2></div><span>{deliveries.filter(item => item.status !== 'Delivered').length} active</span></div>{deliveries.map((item, index) => <button key={item.id} onClick={() => setActive(index)} className={`queue-item ${active === index ? 'selected' : ''}`}><b>{index + 1}</b><div><strong>{item.restaurant} <small>{item.id}</small></strong><span>{item.customer} · {item.eta}</span></div><em>{item.status}</em></button>)}</section>
    </main>
  </div>
}
export default App
