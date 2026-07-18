//import dns from 'dns';
//dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://Prasann:12092007@cluster0.d60adtf.mongodb.net/Foodio')
        .then(() => console.log("DB connected"));
}