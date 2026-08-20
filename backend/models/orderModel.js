import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: "Order Confirmed" },
    statusHistory: { type: Array, default: [] },
    date: { type: Date, default: Date.now() },
    payment: { type: Boolean, default: false },
    paymentMethod: { type: String, enum: ["razorpay", "cod"], default: "razorpay" },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    deliveryPartnerId: { type: String, default: null },
    rejectedBy: { type: [String], default: [] },
    restaurantId: { type: String },
    restaurantName: { type: String },
    promoCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 }
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
