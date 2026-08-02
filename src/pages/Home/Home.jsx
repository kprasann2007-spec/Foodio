import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'

const Home = () => {
  const [category, setCategory] = useState("All");
  const [restaurant, setRestaurant] = useState("All");

  return (
    <main className='home'>
      <Header />
      <section className='home-highlights' aria-label='Why choose Foodio'>
        <div><span className='highlight-icon'>✦</span><p><strong>Handpicked kitchens</strong><span>Local food worth looking forward to</span></p></div>
        <div><span className='highlight-icon'>◷</span><p><strong>Right on time</strong><span>Live updates from kitchen to doorstep</span></p></div>
        <div><span className='highlight-icon'>♡</span><p><strong>Made with care</strong><span>Fresh ingredients, every single order</span></p></div>
      </section>
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} restaurant={restaurant} setRestaurant={setRestaurant} />
      <AppDownload />
    </main>
  )
}

export default Home
