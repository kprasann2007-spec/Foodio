import 'dotenv/config'
import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import promoRouter from "./routes/promoRoute.js"




//app config
const app = express()
const port = 4000

// middleware
app.use(express.json())
//app.use(express.urlencoded({ extended: true }));
app.use(cors())
//app.use("/images", express.static("uploads"))

//db connection 
connectDB();

//api endpoints
app.use("/api/food",foodRouter)
app.use("/images",express.static('uploads')) 
app.use("/api/user",userRouter)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)
app.use("/api/promo",promoRouter)



app.get("/",(req,res)=>{
    res.send("API Working")
})

app.listen(port,()=>{
    console.log(`Server Started on http://localhost:${port}`)
})

//mongodb+srv://foodio:12345@cluster0.u5mqwrb.mongodb.net/?appName=Cluster0