import foodModel from '../models/foodModel.js';
import userModel from '../models/userModel.js';
import fs from 'fs'
import jwt from 'jsonwebtoken'

//add food item
const addFood = async (req, res) => {
    let image_filename = req.file ? `${req.file.filename}` : "";

    try {
        const userId = req.userId || req.body.userId;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "Restaurant user not found" });
        }

        if (!req.body.name || !req.body.price) {
            return res.json({ success: false, message: "Name and Price are required" });
        }

        const food = new foodModel({
            name: req.body.name,
            description: req.body.description || "Delicious freshly prepared dishes",
            price: Number(req.body.price),
            category: req.body.category || "Salad",
            image: image_filename,
            restaurantId: userId,
            restaurantName: user.restaurantName || user.name,
            availability: true
        });

        await food.save();
        res.json({ success: true, message: "Food Added" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error adding food" });
    }
}

// all food list
const listFood = async (req, res) => {
    try {
        let query = {};
        
        // If token is provided in the headers, filter by restaurant
        if (req.headers.token) {
            try {
                const decoded = jwt.verify(req.headers.token, process.env.JWT_SECRET);
                query.restaurantId = decoded.id;
            } catch (err) {
                // If token invalid, don't crash
            }
        }
        
        // If restaurantId is explicitly passed in query params
        if (req.query.restaurantId) {
            query.restaurantId = req.query.restaurantId;
        }

        const foods = await foodModel.find(query);
        res.json({ success: true, data: foods });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching food list" });
    }
}

//remove food item
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    if (!food) {
        return res.json({ success: false, message: "Food item not found" });
    }
    // Delete file if exists
    if (food.image) {
        fs.unlink(`uploads/${food.image}`, () => {});
    }
    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error removing food" });
  }
}

const updateFoodPrice = async (req, res) => {
  try {
    await foodModel.findByIdAndUpdate(req.body.id, { price: req.body.price });
    res.json({ success: true, message: "Price updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
}

export { addFood, listFood, removeFood, updateFoodPrice }
