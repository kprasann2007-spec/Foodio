import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import crypto from "crypto";

const DELIVERY_FEE = 20;

const calculateOrderAmount = (items) => {
    if (!Array.isArray(items) || items.length === 0) return 0;

    const subtotal = items.reduce((total, item) => {
        const price = Number(item.price);
        const quantity = Number(item.quantity);
        if (!Number.isFinite(price) || !Number.isInteger(quantity) || price < 0 || quantity < 1) {
            throw new Error("Invalid cart items");
        }
        return total + price * quantity;
    }, 0);

    return subtotal + DELIVERY_FEE;
};

const createRazorpayOrder = async (amount, receipt) => {
    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env, then restart the backend server.");
    }

    const credentials = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ amount: Math.round(amount * 100), currency: "INR", receipt })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.description || "Unable to create Razorpay order");
    return data;
};

// Create a pending local order and a matching Razorpay order.
const placeOrder = async (req, res) => {
    try {
        const amount = calculateOrderAmount(req.body.items);
        if (!amount || !req.body.address) {
            return res.status(400).json({ success: false, message: "Cart and delivery details are required" });
        }

        const receipt = `foodio_${Date.now()}`;
        const razorpayOrder = await createRazorpayOrder(amount, receipt);
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount,
            address: req.body.address,
            paymentMethod: "razorpay",
            status: "Order Confirmed",
            statusHistory: [{ status: "Order Confirmed", updatedAt: new Date() }],
            razorpayOrderId: razorpayOrder.id
        });
        await newOrder.save();

        res.json({
            success: true,
            key: process.env.RAZORPAY_KEY_ID,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            razorpayOrderId: razorpayOrder.id,
            localOrderId: newOrder._id
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message || "Error creating payment" });
    }
};

const placeCodOrder = async (req, res) => {
    try {
        const amount = calculateOrderAmount(req.body.items);
        if (!amount || !req.body.address) {
            return res.status(400).json({ success: false, message: "Cart and delivery details are required" });
        }

        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount,
            address: req.body.address,
            paymentMethod: "cod",
            status: "Order Confirmed",
            statusHistory: [{ status: "Order Confirmed", updatedAt: new Date() }]
        });
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        res.json({ success: true, message: "Cash on delivery order placed" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error placing cash on delivery order" });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const order = await orderModel.findOne({ razorpayOrderId: razorpay_order_id, userId: req.body.userId });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const receivedSignature = Buffer.from(razorpay_signature || "");
        const expectedSignatureBuffer = Buffer.from(expectedSignature);
        const isValid = receivedSignature.length === expectedSignatureBuffer.length
            && crypto.timingSafeEqual(expectedSignatureBuffer, receivedSignature);
        if (!isValid) return res.status(400).json({ success: false, message: "Payment verification failed" });

        order.payment = true;
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        res.json({ success: true, message: "Payment verified" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error verifying payment" });
    }
};

// fetch orders for a specific user
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching orders" });
    }
};
//listing orders for admin panel
const listOrders =async(req,res)=>{
    try {
        const orders=await orderModel.find({});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }

};
// update order status (admin panel)
const updateStatus = async (req, res) => {
    try {
        const order = await orderModel.findById(req.body.orderId);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        if (order.status !== req.body.status) {
            order.status = req.body.status;
            order.statusHistory = [...(order.statusHistory || []), { status: req.body.status, updatedAt: new Date() }];
            await order.save();
        }
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

export { placeOrder, placeCodOrder, verifyPayment, userOrders ,listOrders,updateStatus};
