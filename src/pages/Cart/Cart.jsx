import React, { useContext, useState } from 'react'
import './Cart.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url, promoCode, setPromoCode, discountAmount, setDiscountAmount, applyPromoCode } = useContext(StoreContext)
  const navigate = useNavigate()
  const [inputCode, setInputCode] = useState("")
  const [promoMessage, setPromoMessage] = useState({ text: '', isError: false })

  const handlePromoSubmit = async () => {
    if (!inputCode.trim()) {
      setPromoMessage({ text: "Please enter a coupon code", isError: true });
      return;
    }
    setPromoMessage({ text: "Applying coupon...", isError: false });
    const res = await applyPromoCode(inputCode);
    if (res.success) {
      setPromoMessage({ text: `${res.message}! Saved ₹${res.discountAmount}`, isError: false });
      setInputCode("");
    } else {
      setPromoMessage({ text: res.message || "Failed to apply coupon", isError: true });
    }
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setDiscountAmount(0);
    setPromoMessage({ text: "Coupon removed", isError: false });
  };

  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item) => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={item._id}>
                <div className="cart-items-title cart-items-item">
                  <img src={url + "/images/" + item.image} alt={item.name} />
                  <p>{item.name}</p>
                  <p>₹{item.price}</p>
                  <p>{cartItems[item._id]}</p>
                  <p>₹{item.price * cartItems[item._id]}</p>
                  <p className='cross' onClick={() => removeFromCart(item._id)}>x</p>
                </div>
                <hr />
              </div>
            )
          }
          return null
        })}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{getTotalCartAmount() === 0 ? 0 : 20}</p>
            </div>
            <hr />
            {discountAmount > 0 && (
              <>
                <div className="cart-total-details">
                  <p>Discount ({promoCode})</p>
                  <p style={{ color: "#d94e34", fontWeight: "600" }}>-₹{discountAmount}</p>
                </div>
                <hr />
              </>
            )}
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{getTotalCartAmount() === 0 ? 0 : Math.max(0, getTotalCartAmount() + 20 - discountAmount)}</b>
            </div>
          </div>
          <button disabled={getTotalCartAmount() === 0} onClick={() => navigate('/order')}>PROCEED TO CHECKOUT</button>
        </div>

        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder='promo code' value={inputCode} onChange={e => setInputCode(e.target.value)} />
              <button onClick={handlePromoSubmit}>Submit</button>
            </div>
            {promoMessage.text && (
              <p className={`promo-message ${promoMessage.isError ? 'error' : 'success'}`} style={{
                fontSize: "0.85rem",
                marginTop: "8px",
                fontWeight: "500",
                color: promoMessage.isError ? "#d94e34" : "#1e7149"
              }}>
                {promoMessage.text}
              </p>
            )}
            {promoCode && (
              <div className="applied-promo-info" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "12px",
                background: "#f4faf6",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #e1e7e4",
                fontSize: "0.88rem"
              }}>
                <span>Coupon: <strong>{promoCode}</strong> applied</span>
                <button onClick={handleRemovePromo} style={{
                  background: "transparent",
                  border: "none",
                  color: "#d94e34",
                  fontWeight: "600",
                  cursor: "pointer"
                }}>Remove</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
