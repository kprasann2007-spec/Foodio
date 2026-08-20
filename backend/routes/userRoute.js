import express from "express"
import {loginUser,registerUser,getUserProfile,listRestaurants} from "../controllers/userController.js"
import authMiddleware from "../middleware/auth.js"

const userRouter=express.Router()

userRouter.post("/register",registerUser)
userRouter.post("/login",loginUser)
userRouter.post("/profile",authMiddleware,getUserProfile)
userRouter.get("/restaurants",listRestaurants)

export default userRouter;