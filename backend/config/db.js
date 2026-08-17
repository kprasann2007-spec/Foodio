//import dns from 'dns';
//dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from "mongoose";

export const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://Prasann:12092007@cluster0.d60adtf.mongodb.net/Foodio';
    mongoose.set('bufferCommands', false);

    try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
        console.log("DB connected");
    } catch (error) {
        // Keep the API online so it can return an actionable error instead of the browser reporting "Failed to fetch".
        console.error("Database connection failed:", error.message);
    }
}
