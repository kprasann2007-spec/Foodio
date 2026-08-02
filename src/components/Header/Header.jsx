import React from 'react'
import './Header.css'
import { assets } from '../../assets/assets'

const Header = () => {
  const scrollToMenu = () => document.querySelector('#food-display')?.scrollIntoView({ behavior: 'smooth' })

  return <section className='header' id='header'>
    <div className='header-copy'>
      <span className='eyebrow'>Your neighbourhood table</span>
      <h1>Eat well,<br /><em>without the wait.</em></h1>
      <p>Discover the meals your city keeps coming back for. Thoughtfully made, packed with care, and delivered to your door.</p>
      <div className='header-actions'><button type='button' onClick={scrollToMenu}>Browse dishes <span>↗</span></button><a href='#explore-menu'>Choose a cuisine</a></div>
      <div className='header-trust'><div className='trust-avatars'><i></i><i></i><i></i></div><p><strong>12k+</strong> happy diners this month</p></div>
    </div>
    <div className='header-visual'>
      <img src={assets.header_img} alt='A colourful spread of freshly prepared food' />
      <div className='visual-label visual-label-top'><span>✦</span><p>Made nearby<br /><strong>Just for you</strong></p></div>
      <div className='visual-label visual-label-bottom'><strong>4.9</strong><span> / 5 average rating</span></div>
      <div className='visual-blob' aria-hidden='true'></div>
    </div>
  </section>
}

export default Header
