import React from 'react';
import './ExploreMenu.css';
import { menu_list } from '../../assets/assets';

const ExploreMenu = ({ category, setCategory }) => {
  const selectCategory = name => {
    setCategory(previous => previous === name ? 'All' : name)
    document.querySelector('#food-display')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return <section className='explore-menu' id='explore-menu'>
    <div className='section-heading'>
      <div><span className='section-kicker'>Find your flavour</span><h2>What are you craving?</h2></div>
      <p>From bright, feel-good bowls to warm comfort favourites, there is something made for every kind of appetite.</p>
    </div>
    <div className='explore-menu-list'>
      {menu_list.map((item) => <button type='button' onClick={() => selectCategory(item.menu_name)} key={item.menu_name} className={`explore-menu-list-item ${category === item.menu_name ? 'active' : ''}`} aria-pressed={category === item.menu_name}>
        <img src={item.menu_image} alt='' /><span>{item.menu_name}</span>
      </button>)}
    </div>
  </section>
}

export default ExploreMenu;
