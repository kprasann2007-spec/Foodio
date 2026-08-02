import React, { useState, useEffect } from 'react'
import './List.css'
import axios from "axios"
import {toast} from "react-toastify"

const List = ({url}) => {

  
    const [list,setlist] = useState([]);

    const fetchList = async()=>{
        const response = await axios.get(`${url}/api/food/list`);
        if(response.data.success){
            setlist(response.data.data);
        }
        else{
            toast.error("Error")
        }
    }

    const removeFood = async(foodId) =>{
        const response = await axios.post(`${url}/api/food/remove`,{id:foodId});
        await fetchList();
        if(response.data.success){
            toast.success(response.data.message)
        }
        else{
            toast.error("Error");
        }
    }

    const updatePrice = async (foodId, price) => {
        const response = await axios.post(`${url}/api/food/update`, { id: foodId, price: Number(price) });
        if (response.data.success) {
            setlist(items => items.map(item => item._id === foodId ? { ...item, price: Number(price) } : item));
            toast.success("Price updated");
        } else {
            toast.error("Could not update price");
        }
    }

    useEffect(()=>{
        fetchList();
    },[])

  return (
    <div className='list add flex-col'>
      <p>All Foods List</p>
      <div className="list-table">
        <div className="list-table-format title">
            <b>Image</b>
            <b>Name</b>
            <b>Category</b>
            <b>Price</b>
            <b>Action</b>
        </div>
        {list.map((item ,index)=>{
            return(
                <div key={index} className="list-table-format">
                    <img src={`${url}/images/`+item.image} alt="" />
                    <p>{item.name}</p>
                    <p>{item.category}</p>
                    <label className="price-editor">₹<input type="number" min="0" value={item.price} onChange={(event) => updatePrice(item._id, event.target.value)} /></label>
                    <p onClick={()=>removeFood(item._id)} className='cursor'>X</p>
                </div>
            )
        })}
      </div>
    </div>
  )
}

export default List
