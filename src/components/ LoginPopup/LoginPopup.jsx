import React, { useState, useContext } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'

const LoginPopup = ({setShowLogin}) => {

    const { setToken } = useContext(StoreContext)
    const [currState,setCurrState]=useState("Login")
    const [accountType,setAccountType]=useState("customer")
    const { url } = useContext(StoreContext)
    const [formData, setFormData] = useState({ name: '', email: '', password: '', restaurantName: '' })
    const [error, setError] = useState('')

    const onChange = (event) => {
      setFormData((previous) => ({ ...previous, [event.target.name]: event.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('')
        try {
          const endpoint = currState === 'Login' ? 'login' : 'register'
          const response = await fetch(`${url}/api/user/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currState === 'Login'
              ? { email: formData.email, password: formData.password }
              : { ...formData, role: accountType })
          })
          const result = await response.json()
          if (!response.ok || !result.success) throw new Error(result.message || 'Unable to sign in')
          
          localStorage.setItem('token', result.token)
          setToken(result.token)
          
          if (accountType === "delivery") {
              window.location.href = `http://localhost:5175?token=${result.token}`;
          } else if (accountType === "restaurant") {
              window.location.href = `http://localhost:5174?token=${result.token}`;
          } else {
              setShowLogin(false)
          }
        } catch (loginError) {
          setError(loginError instanceof TypeError
            ? 'Cannot reach the API server. Start it with “npm run server” inside the backend folder.'
            : loginError.message)
        }
    }



  return (
    <div className='login-popup'>
      <form onSubmit={handleSubmit} className="login-popup-container">
        <div className="login-popup-title">
            <h2>{currState}</h2>
            <img onClick={()=>setShowLogin(false) } src={assets.cross_icon} alt="" />
        </div>
        <div className="login-popup-inputs">
            {currState==="Login"?<></>:<input name="name" value={formData.name} onChange={onChange} type="text" placeholder='Your name' required />}
            {currState==="Sign Up" && accountType==="restaurant" && <input name="restaurantName" value={formData.restaurantName} onChange={onChange} type="text" placeholder='Restaurant Name' required />}
            <input name="email" value={formData.email} onChange={onChange} type="email" placeholder='Your email' required />
            <input name="password" value={formData.password} onChange={onChange} type="password" placeholder='Password' required />
            <select
              className="login-popup-select"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              required
            >
              <option value="customer">Customer</option>
              <option value="restaurant">Restaurant</option>
              <option value="delivery">Delivery Partner</option>
            </select>
        </div>
        <button>{currState==="Sign Up"?"Create account":"Login"}</button>
        {error && <p className="login-popup-error" role="alert">{error}</p>}
        <div className="login-popup-condition">
          <input type="checkbox" required/>
          <p>By continuing, i agree to the terms of use & privacy policy.</p>
        </div>
        {currState==="Login"
        ?<p>Create a new account? <span onClick={()=>setCurrState("Sign Up")}>Click here</span></p>
        :<p>Already have an account? <span onClick={()=>setCurrState("Login")}>Login here</span></p>
        }
      </form>
    </div>
  )
}

export default LoginPopup
