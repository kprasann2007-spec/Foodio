import express from "express";
import { addFood,listFood,removeFood,updateFoodPrice } from "../controllers/foodController.js";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";

const foodRouter = express.Router();

// Image storage Engine 
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req,file,cb)=>{
        return cb(null,`${Date.now()}${file.originalname}`)
    }
})

const upload = multer({ storage: storage })
foodRouter.post("/add", authMiddleware, upload.single("image"), addFood);
foodRouter.get("/list",listFood);
foodRouter.post("/remove", authMiddleware, removeFood);
foodRouter.post("/update", authMiddleware, updateFoodPrice);


export default foodRouter;
