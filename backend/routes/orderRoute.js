import express from "express";
import { placeOrder, placeCodOrder, verifyPayment, userOrders, listOrders, updateStatus, getIncomingOrders, acceptOrder, declineOrder, getActiveDeliveries, getDeliveryHistory, getRestaurantIncomingOrders, getRestaurantPastOrders } from "../controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/cod", authMiddleware, placeCodOrder);
orderRouter.post("/verify", authMiddleware, verifyPayment);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/list", listOrders);
orderRouter.post("/status", updateStatus);

// Delivery Partner Dashboard endpoints
orderRouter.post("/incoming", authMiddleware, getIncomingOrders);
orderRouter.post("/accept", authMiddleware, acceptOrder);
orderRouter.post("/decline", authMiddleware, declineOrder);
orderRouter.post("/active", authMiddleware, getActiveDeliveries);
orderRouter.post("/history", authMiddleware, getDeliveryHistory);

// Restaurant Dashboard endpoints
orderRouter.post("/restaurant/incoming", authMiddleware, getRestaurantIncomingOrders);
orderRouter.post("/restaurant/past", authMiddleware, getRestaurantPastOrders);

export default orderRouter;
