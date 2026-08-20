import React, { useState , useContext} from 'react'
import { StoreContext} from '../../context/StoreContext'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
const Navbar = ({ setShowLogin }) => {

    const [menu, setMenu] = useState("home");
    const {getTotalCartAmount,token,setToken,cartItems} = useContext(StoreContext);
    const navigate = useNavigate(); 
    const logout =()=>{
        localStorage.removeItem("token");
        setToken("");
        navigate("/");
    }

    const cartCount = Object.values(cartItems || {}).reduce((sum, qty) => sum + (qty > 0 ? qty : 0), 0);

    return (
        <div className='navbar'>
            <Link to='/' className="brand">
                <span>F</span>
                <div>
                    <strong>FOODIO</strong>
                    <small>DELICIOUS DELIVERED</small>
                </div>
            </Link>
            <ul className="navbar-menu">
                <Link to='/' onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>Home</Link>
                <a href='#explore-menu' onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>Menu</a>
                <a href='#app-download' onClick={() => setMenu("mobile-app")} className={menu === "mobile-app" ? "active" : ""}>Mobile App</a>
                <a href='#footer' onClick={() => setMenu("contact-us")} className={menu === "contact-us" ? "active" : ""}>Contact Us</a>
            </ul>
            <div className="navbar-right">
                <img src={assets.search_icon} alt="" />
                <div className="navbar-search-icon">
                    <Link to='/cart' className="cart-icon-container" aria-label="View Cart">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-cart">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        {cartCount > 0 && (
                            <span className="cart-badge">{cartCount}</span>
                        )}
                    </Link>
                </div>
                
                {!token?<button onClick={() => setShowLogin(true)}>sign in</button>
                :<div className ='navbar-profile'>
                    <img src={assets.profile_icon} alt="" />
                    <ul className = "nav-profile-dropdown">
                        <li onClick={() => navigate('/myorders')}><img src={assets.bag_icon} alt="" /><p>Orders</p></li>
                        <hr />
                        <li onClick={logout}><img src={assets.logout_icon} alt="" /><p>Logout</p></li>
                        </ul> 
            </div>}
            </div>
        </div>
    )
}
export default Navbar
