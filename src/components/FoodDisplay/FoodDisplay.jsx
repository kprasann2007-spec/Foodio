import React, { useContext, useMemo, useState } from 'react'
import './FoodDisplay.css'
import FoodItem from '../FoodItem/FoodItem'
import { StoreContext } from '../../context/StoreContext'
import { restaurants } from '../../assets/assets'

const FoodDisplay = ({ category, restaurant, setRestaurant }) => {
  const { food_list } = useContext(StoreContext)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('recommended')
  const query = search.trim().toLowerCase()

  const enrichedRestaurants = useMemo(() => restaurants.map(place => {
    const menu = food_list.filter(item => place.menuIds.includes(item._id))
    const averagePrice = Math.round(menu.reduce((total, item) => total + item.price, 0) / menu.length)
    const restaurantMatch = [place.name, place.type, place.description].some(value => value.toLowerCase().includes(query))
    const matchingDishes = menu.filter(item => [item.name, item.category, item.description].some(value => value.toLowerCase().includes(query)))
    return { ...place, menu, averagePrice, restaurantMatch, matchingDishes }
  }), [food_list, query])

  const matchingRestaurants = enrichedRestaurants
    .filter(place => !query || place.restaurantMatch || place.matchingDishes.length)
    .sort((a, b) => sort === 'rating' ? b.rating - a.rating : sort === 'price-low' ? a.averagePrice - b.averagePrice : 0)

  const activeRestaurant = matchingRestaurants.find(place => place.id === restaurant)
  const visibleRestaurantIds = activeRestaurant ? [activeRestaurant.id] : matchingRestaurants.map(place => place.id)
  const dishes = food_list
    .filter(item => visibleRestaurantIds.some(id => restaurants.find(place => place.id === id)?.menuIds.includes(item._id)))
    .filter(item => category === 'All' || category === item.category)
    .filter(item => {
      if (!query) return true
      const place = enrichedRestaurants.find(candidate => candidate.menuIds.includes(item._id))
      return place?.restaurantMatch || [item.name, item.category, item.description].some(value => value.toLowerCase().includes(query))
    })
    .map(item => ({ ...item, restaurant: restaurants.find(place => place.menuIds.includes(item._id)) }))

  const selectRestaurant = id => setRestaurant(restaurant === id ? 'All' : id)

  return <section className='food-display' id='food-display'>
    <div className='food-display-heading'><div><span className='section-kicker'>Choose your kitchen</span><h2>{activeRestaurant ? activeRestaurant.name : 'Three kitchens, one great meal'}</h2></div><p>{dishes.length} delicious picks</p></div>
    <div className='menu-tools'>
      <label className='menu-search'><span>⌕</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder='Search restaurants or dishes' aria-label='Search restaurants or dishes' /></label>
      <label className='restaurant-sort'>Sort restaurants <select value={sort} onChange={event => setSort(event.target.value)}><option value='recommended'>Recommended</option><option value='rating'>Highest rated</option><option value='price-low'>Lowest average price</option></select></label>
    </div>
    <div className='restaurant-list'>
      <button type='button' className={`restaurant-card ${restaurant === 'All' ? 'active' : ''}`} onClick={() => setRestaurant('All')}><span className='restaurant-mark'>✦</span><span><strong>All restaurants</strong><small>{matchingRestaurants.length} kitchens available</small></span></button>
      {matchingRestaurants.map(place => <button type='button' key={place.id} className={`restaurant-card ${restaurant === place.id ? 'active' : ''}`} onClick={() => selectRestaurant(place.id)}><span className='restaurant-mark'>{place.id === 'green-garden' ? '♧' : place.id === 'spice-house' ? '✺' : '◒'}</span><span><strong>{place.name}</strong><small>★ {place.rating} · Avg. ₹{place.averagePrice}</small></span></button>)}
    </div>
    {query && <p className='restaurant-intro'>{matchingRestaurants.length ? `${matchingRestaurants.length} restaurant${matchingRestaurants.length === 1 ? '' : 's'} match “${search}”.` : `No restaurant or dish matches “${search}”.`} {activeRestaurant && <button type='button' onClick={() => setRestaurant('All')}>View all matches</button>}</p>}
    {!query && activeRestaurant && <p className='restaurant-intro'>{activeRestaurant.description} <button type='button' onClick={() => setRestaurant('All')}>View all restaurants</button></p>}
    <div className='food-display-list'>{dishes.map(item => <FoodItem key={item._id} {...item} />)}</div>
    {!dishes.length && <div className='menu-empty'><strong>No dishes found.</strong><p>Try another dish, restaurant, or cuisine.</p></div>}
  </section>
}

export default FoodDisplay
