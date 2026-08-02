import React from 'react'
import './AppDownload.css'
import { assets } from '../../assets/assets'
const AppDownload = () => <section className='app-download' id='app-download'><div><span className='section-kicker'>Foodio on the go</span><h2>Your next favourite meal is one tap away.</h2><p>Order, track, and enjoy a little more ease with the Foodio app.</p></div><div className='app-download-platforms'><img src={assets.play_store} alt='Get it on Google Play' /><img src={assets.app_store} alt='Download on the App Store' /></div></section>
export default AppDownload
