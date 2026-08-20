import React, { useContext } from 'react'
import './FoodItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'

const FoodItem = ({ _id: id, name, price, description, image, restaurant }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext)
  const quantity = cartItems[id] || 0

  const imageUrl = image && (image.startsWith('/') || image.startsWith('http') || image.startsWith('data:'))
    ? image
    : `${url}/images/${image}`;

  return <article className='food-item'>
    <div className='food-item-img-container'>
      <img className='food-item-img' src={imageUrl} alt={name} />
      {quantity === 0 ? <button className='add' onClick={() => addToCart(id)} aria-label={`Add ${name} to cart`}><img src={assets.add_icon_white} alt='' /></button> : <div className='food-item-counter' aria-label={`${quantity} ${name} in cart`}><button onClick={() => removeFromCart(id)} aria-label={`Remove one ${name}`}><img src={assets.remove_icon_red} alt='' /></button><p>{quantity}</p><button onClick={() => addToCart(id)} aria-label={`Add one ${name}`}><img src={assets.add_icon_green} alt='' /></button></div>}
    </div>
    <div className='food-item-info'><div className='food-item-name-rating'><h3>{name}</h3><img src={assets.rating_starts} alt='Rated 5 out of 5' /></div><p className='food-item-desc'>{description}</p><p className='food-item-restaurant'>From {restaurant?.name}</p><p className='food-item-price'>₹{price}</p></div>
  </article>
}
export default FoodItem
