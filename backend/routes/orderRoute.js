import express from "express";
import { placeOrder, placeCodOrder, verifyPayment, userOrders, listOrders, updateStatus } from "../controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/cod", authMiddleware, placeCodOrder);
orderRouter.post("/verify", authMiddleware, verifyPayment);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/list", listOrders);
orderRouter.post("/status", updateStatus);

export default orderRouter;
