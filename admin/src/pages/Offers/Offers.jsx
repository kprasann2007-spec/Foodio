import React, { useState } from 'react'
import './Offers.css'

const Offers = () => {
  const [offers, setOffers] = useState([
    { code: 'WELCOME15', discount: '15% off first order', active: true },
    { code: 'LUNCH20', discount: '₹20 off orders above ₹199', active: false }
  ])
  const [form, setForm] = useState({ code: '', discount: '' })
  const addOffer = event => {
    event.preventDefault()
    if (!form.code || !form.discount) return
    setOffers(items => [...items, { ...form, code: form.code.toUpperCase(), active: true }])
    setForm({ code: '', discount: '' })
  }
  const toggle = code => setOffers(items => items.map(offer => offer.code === code ? { ...offer, active: !offer.active } : offer))

  return <div className='offers add'>
    <div className='offers-heading'><div><p className='eyebrow'>Promotions</p><h3>Offers & discounts</h3><span>Create campaigns customers can apply at checkout.</span></div></div>
    <form className='offer-form' onSubmit={addOffer}><input value={form.code} onChange={event => setForm({ ...form, code: event.target.value })} placeholder='Offer code (e.g. SAVE20)' /><input value={form.discount} onChange={event => setForm({ ...form, discount: event.target.value })} placeholder='Discount details' /><button type='submit'>Create offer</button></form>
    <div className='offer-list'>{offers.map(offer => <article key={offer.code}><div><strong>{offer.code}</strong><p>{offer.discount}</p></div><button type='button' onClick={() => toggle(offer.code)} className={offer.active ? 'offer-active' : ''}>{offer.active ? 'Active' : 'Paused'}</button></article>)}</div>
  </div>
}

export default Offers
