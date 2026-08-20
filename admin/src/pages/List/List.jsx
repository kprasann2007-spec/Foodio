import React, { useState, useEffect } from 'react'
import './List.css'
import axios from "axios"
import { toast } from "react-toastify"

const List = ({ url, token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    if (!token) return
    setLoading(true)
    try {
      const response = await axios.get(`${url}/api/food/list`, {
        headers: { token }
      });
      if (response.data.success) {
        setList(response.data.data || []);
      } else {
        toast.error("Error fetching food list")
      }
    } catch (error) {
      console.error("Error fetching list:", error)
      toast.error("Could not fetch food list")
    } finally {
      setLoading(false)
    }
  }

  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId }, {
        headers: { token }
      });
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList();
      } else {
        toast.error(response.data.message || "Error removing food")
      }
    } catch (error) {
      console.error("Error removing food:", error)
      toast.error("Error removing food")
    }
  }

  const updatePrice = async (foodId, price) => {
    if (Number(price) <= 0) {
      toast.error("Price must be a positive number.");
      return;
    }
    try {
      const response = await axios.post(`${url}/api/food/update`, { id: foodId, price: Number(price) }, {
        headers: { token }
      });
      if (response.data.success) {
        setList(items => items.map(item => item._id === foodId ? { ...item, price: Number(price) } : item));
        toast.success("Price updated");
      } else {
        toast.error(response.data.message || "Could not update price");
      }
    } catch (error) {
      console.error("Error updating price:", error)
      toast.error("Error updating price")
    }
  }

  useEffect(() => {
    fetchList();
  }, [token])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your menu catalog...</p>
      </div>
    )
  }

  return (
    <div className='list add flex-col'>
      <div className="section-header">
        <p className="eyebrow">Catalog</p>
        <h2>List Items</h2>
        <span>View and manage all food items active in your restaurant's menu.</span>
      </div>

      {list.length === 0 ? (
        <div className="empty-state-card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <h3>You haven't added any food items yet</h3>
          <p>Add your first food item from the menu sidebar to start receiving orders.</p>
        </div>
      ) : (
        <div className="list-table">
          <div className="list-table-format title">
            <b>Image</b>
            <b>Name</b>
            <b>Category</b>
            <b>Price</b>
            <b>Action</b>
          </div>
          {list.map((item, index) => {
            return (
              <div key={index} className="list-table-format">
                <img src={`${url}/images/` + item.image} alt={item.name} className="list-food-image" />
                <p className="list-food-name">{item.name}</p>
                <p className="list-food-category">{item.category}</p>
                <div className="price-editor-container">
                  <span>₹</span>
                  <input
                    type="number"
                    min="1"
                    value={item.price}
                    onChange={(event) => updatePrice(item._id, event.target.value)}
                  />
                </div>
                <button type="button" onClick={() => removeFood(item._id)} className='remove-item-btn' aria-label="Remove item">
                  Remove
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default List
