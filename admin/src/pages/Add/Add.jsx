import React, { useState } from 'react'
import './Add.css'
import { assets } from '../../assets/assets'
import axios from "axios"
import { toast } from 'react-toastify'

const Add = ({ url, token, profile }) => {
  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad"
  })

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }))
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!token) {
      toast.error("You must be logged in to add items.");
      return;
    }

    if (!data.name.trim()) {
      toast.error("Food name is required.");
      return;
    }

    if (Number(data.price) <= 0) {
      toast.error("Price must be a positive number.");
      return;
    }

    if (!image) {
      toast.error("Please upload a food image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name)
    formData.append("description", data.description || "Delicious freshly prepared dishes")
    formData.append("price", Number(data.price))
    formData.append("category", data.category)
    formData.append("image", image)

    try {
      const response = await axios.post(`${url}/api/food/add`, formData, {
        headers: { token }
      })
      if (response.data.success) {
        setData({
          name: "",
          description: "",
          price: "",
          category: "Salad"
        })
        setImage(false)
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message || "Error adding item")
      }
    } catch (err) {
      console.error("Error submitting food item:", err)
      toast.error("Could not add item. Check server connection.")
    }
  }

  return (
    <div className='add flex-col'>
      <div className="section-header">
        <p className="eyebrow">Inventory</p>
        <h2>Add Food Item</h2>
        <span>Add a new dish to your restaurant menu list.</span>
      </div>

      <form className='flex-col add-form-container' onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" className="upload-preview-img" />
          </label>
          <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden required />
          <small className="image-tip">Click box above to select a PNG or JPG image.</small>
        </div>

        <div className="add-restaurant-name flex-col">
          <p>Restaurant Name</p>
          <input type="text" value={profile?.restaurantName || profile?.name || "Loading..."} readOnly className="readonly-input" />
        </div>

        <div className="add-product-name flex-col">
          <p>Food Name</p>
          <input onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='e.g. Margherita Pizza' required />
        </div>

        <div className="add-product-description flex-col">
          <p>Description</p>
          <textarea onChange={onChangeHandler} value={data.description} name="description" rows="4" placeholder='e.g. Classic cheese pizza with fresh basil and olive oil.'></textarea>
        </div>

        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Category</p>
            <select onChange={onChangeHandler} value={data.category} name="category">
              <option value="Salad">Salad</option>
              <option value="Rolls">Rolls</option>
              <option value="Desserts">Desserts</option>
              <option value="Sandwich">Sandwich</option>
              <option value="Cake">Cake</option>
              <option value="Pure Veg">Pure veg</option>
              <option value="Pasta">Pasta</option>
              <option value="Noodles">Noodles</option>
            </select>
          </div>
          <div className="add-price flex-col">
            <p>Price (₹)</p>
            <input onChange={onChangeHandler} value={data.price} type="Number" name='price' placeholder='299' required />
          </div>
        </div>

        <button type='submit' className='add-btn'>ADD ITEM</button>
      </form>
    </div>
  )
}

export default Add
