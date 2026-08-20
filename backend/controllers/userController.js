import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"

//login user
const loginUser=async(req,res)=>{
    const {email,password}=req.body;
    try{
        const user=await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:"User Doesn't exist"})
        }

        const isMatch=await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.json({success:false,message:"Invalid credentials"})
        }

        const token=createToken(user._id);
        res.json({success:true,token})
    }catch(error){
        console.log(error);
        res.status(503).json({success:false,message:"Database connection is unavailable. Check MONGODB_URI and database network access."})
    }
}

const createToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET)
}

//register user
const registerUser=async(req,res)=>{
    const {name,password,email,role,restaurantName}=req.body;
    const allowedRoles=["customer","restaurant","delivery"];
    const userRole=allowedRoles.includes(role)?role:"customer";
    try{
        if (userRole === "restaurant") {
            if (!restaurantName || !restaurantName.trim()) {
                return res.json({ success: false, message: "Restaurant name is required" });
            }
            // Check if restaurant name already exists
            const existingRestaurant = await userModel.findOne({ role: "restaurant", restaurantName: restaurantName.trim() });
            if (existingRestaurant) {
                const token = createToken(existingRestaurant._id);
                return res.json({ success: true, token, message: "Logged in to existing restaurant account" });
            }
        }

        //checking is user already exists
        const exists=await userModel.findOne({email});
        if(exists){
            return res.json({success:false,message:"User already exists"})
        }

        //validating email format & strong password
        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Please enter a valid email"})
        }

        if(password.length<8){
            return res.json({success:false,message:"Please enter a strong password"})
        }
        //hashing user password
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt);

        const newUser=new userModel({
            name: userRole === "restaurant" ? restaurantName.trim() : name,
            email:email,
            password:hashedPassword,
            role:userRole,
            restaurantName: userRole === "restaurant" ? restaurantName.trim() : undefined
        })
        const user=await newUser.save()
        const token=createToken(user._id)
        res.json({success:true,token});
    }
    catch(error){
        console.log(error);
        res.status(503).json({success:false,message:"Database connection is unavailable. Check MONGODB_URI and database network access."})
    }
}

// get user profile details
const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                restaurantName: user.restaurantName
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching user profile" });
    }
};

// list all restaurants
const listRestaurants = async (req, res) => {
    try {
        const restaurantsList = await userModel.find({ role: "restaurant" });
        const data = restaurantsList.map(r => ({
            id: r._id.toString(),
            name: r.restaurantName || r.name,
            type: "Veg & non-veg",
            rating: 4.5,
            description: "Delicious freshly prepared dishes",
            badge: "Top rated"
        }));
        res.json({ success: true, data });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching restaurants" });
    }
};

export {loginUser,registerUser,getUserProfile,listRestaurants}
