import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    image: {type: String, required: true},
    category: {type: String, required: true},
    restaurantId: {type: String, required: true},
    restaurantName: {type: String, required: true},
    availability: {type: Boolean, default: true},
    createdAt: {type: Date, default: Date.now}
});

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

export default foodModel;