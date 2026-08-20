import React, { useContext, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'

const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true)
  const script = document.createElement('script')
  script.src = 'https://checkout.razorpay.com/v1/checkout.js'
  script.onload = () => resolve(true)
  script.onerror = () => resolve(false)
  document.body.appendChild(script)
})

const PlaceOrder = () => {
  const { cartItems, food_list, getTotalCartAmount, setCartItems, token, url, promoCode, discountAmount, setPromoCode, setDiscountAmount } = useContext(StoreContext)
  const navigate = useNavigate()
  const [address, setAddress] = useState({ firstName: '', lastName: '', email: '', street: '', city: '', state: '', zipCode: '', country: '', phone: '' })
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [isPaying, setIsPaying] = useState(false)
  const [error, setError] = useState('')
  const subtotal = getTotalCartAmount()
  const total = subtotal === 0 ? 0 : Math.max(0, subtotal + 20 - discountAmount)

  const updateAddress = (event) => setAddress((previous) => ({ ...previous, [event.target.name]: event.target.value }))

  const getItems = () => food_list
    .filter((item) => cartItems[item._id] > 0)
    .map((item) => ({ _id: item._id, name: item.name, price: item.price, quantity: cartItems[item._id] }))

  const placeCodOrder = async () => {
    const response = await fetch(`${url}/api/order/cod`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', token },
      body: JSON.stringify({ items: getItems(), address, promoCode: promoCode || null })
    })
    const result = await response.json()
    if (!response.ok || !result.success) throw new Error(result.message || 'Unable to place the COD order.')
    setCartItems({})
    setPromoCode("")
    setDiscountAmount(0)
    navigate('/myorders')
  }

  const handlePayment = async (event) => {
    event.preventDefault()
    setError('')
    if (!token) return setError('Please sign in before making a payment.')
    if (!subtotal) return setError('Your cart is empty.')

    setIsPaying(true)
    try {
      if (paymentMethod === 'cod') {
        await placeCodOrder()
        return
      }

      const response = await fetch(`${url}/api/order/place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', token },
        body: JSON.stringify({ items: getItems(), address, promoCode: promoCode || null })
      })
      const order = await response.json()
      if (!response.ok || !order.success) throw new Error(order.message || 'Unable to start payment.')

      const loaded = await loadRazorpay()
      if (!loaded) throw new Error('Razorpay checkout could not be loaded. Please check your connection and try again.')

      const razorpay = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'Foodio',
        description: 'Food order payment',
        order_id: order.razorpayOrderId,
        prefill: { name: `${address.firstName} ${address.lastName}`.trim(), email: address.email, contact: address.phone },
        theme: { color: '#e85d3f' },
        handler: async (payment) => {
          try {
            const verification = await fetch(`${url}/api/order/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', token },
              body: JSON.stringify(payment)
            })
            const result = await verification.json()
            if (!verification.ok || !result.success) throw new Error(result.message || 'Payment could not be verified.')
            setCartItems({})
            setPromoCode("")
            setDiscountAmount(0)
            navigate('/myorders')
          } catch (verificationError) {
            setError(verificationError.message)
          } finally {
            setIsPaying(false)
          }
        },
        modal: { ondismiss: () => setIsPaying(false) }
      })
      razorpay.open()
    } catch (paymentError) {
      setError(paymentError.message)
      setIsPaying(false)
    }
  }

  return (
    <form className='place-order' onSubmit={handlePayment}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input name="firstName" value={address.firstName} onChange={updateAddress} type="text" placeholder="First Name" required />
          <input name="lastName" value={address.lastName} onChange={updateAddress} type="text" placeholder="Last Name" required />
        </div>
        <input name="email" value={address.email} onChange={updateAddress} type="email" placeholder='Email Address' required />
        <input name="street" value={address.street} onChange={updateAddress} type="text" placeholder='Street' required />
        <div className="multi-fields">
          <input name="city" value={address.city} onChange={updateAddress} type="text" placeholder="City" required />
          <input name="state" value={address.state} onChange={updateAddress} type="text" placeholder="State" required />
        </div>
        <div className="multi-fields">
          <input name="zipCode" value={address.zipCode} onChange={updateAddress} type="text" placeholder="ZipCode" required />
          <input name="country" value={address.country} onChange={updateAddress} type="text" placeholder="Country" required />
        </div>
        <input name="phone" value={address.phone} onChange={updateAddress} type="tel" placeholder='Phone' required />
      </div>

      <div className='place-order-right'>
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details"><p>Subtotal</p><p>₹{subtotal}</p></div><hr />
            <div className="cart-total-details"><p>Delivery Fee</p><p>₹{subtotal === 0 ? 0 : 20}</p></div><hr />
            {discountAmount > 0 && (
              <>
                <div className="cart-total-details">
                  <p>Discount ({promoCode})</p>
                  <p style={{ color: "#d94e34", fontWeight: "600" }}>-₹{discountAmount}</p>
                </div>
                <hr />
              </>
            )}
            <div className="cart-total-details"><b>Total</b><b>₹{total}</b></div>
          </div>
          {error && <p className="payment-error" role="alert">{error}</p>}
          <fieldset className="payment-methods">
            <legend>Payment method</legend>
            <label>
              <input type="radio" name="paymentMethod" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} />
              <span><b>Pay online</b><small>Cards, UPI and wallets — secured by Razorpay</small></span>
            </label>
            <label>
              <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
              <span><b>Cash on delivery</b><small>Pay when your food arrives</small></span>
            </label>
          </fieldset>
          <button type='submit' disabled={isPaying || subtotal === 0}>{isPaying ? 'PROCESSING…' : paymentMethod === 'cod' ? 'PLACE COD ORDER' : 'PAY SECURELY'}</button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder
