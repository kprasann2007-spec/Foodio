import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import promoModel from "../models/promoModel.js";
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

// Create pending local orders split by restaurant and a matching Razorpay order.
const placeOrder = async (req, res) => {
    try {
        const items = req.body.items;
        if (!items || items.length === 0 || !req.body.address) {
            return res.status(400).json({ success: false, message: "Cart and delivery details are required" });
        }

        // Group items by restaurantId
        const groups = {};
        for (const item of items) {
            const food = await foodModel.findById(item._id);
            const rId = food ? (food.restaurantId || "green-garden") : "green-garden";
            const rName = food ? (food.restaurantName || "Green Garden Kitchen") : "Green Garden Kitchen";
            const foodPrice = food ? food.price : item.price;
            
            if (!groups[rId]) {
                groups[rId] = {
                    name: rName,
                    items: []
                };
            }
            groups[rId].items.push({
                ...item,
                price: foodPrice
            });
        }

        const totalSubtotal = items.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0);
        
        // Re-validate and calculate promo discount securely
        let discountTotal = 0;
        let appliedPromo = null;
        if (req.body.promoCode) {
            appliedPromo = await promoModel.findOne({ code: req.body.promoCode.toUpperCase().trim() });
            if (appliedPromo && appliedPromo.isActive && new Date(appliedPromo.expiryDate) >= new Date()) {
                const userCount = appliedPromo.userUsage ? (appliedPromo.userUsage.get(req.body.userId) || 0) : 0;
                if ((appliedPromo.usageLimit === null || appliedPromo.usageCount < appliedPromo.usageLimit) && 
                    (appliedPromo.userUsageLimit === null || userCount < appliedPromo.userUsageLimit)) {
                    
                    if (totalSubtotal >= appliedPromo.minOrderValue) {
                        if (appliedPromo.discountType === "percentage") {
                            discountTotal = (totalSubtotal * appliedPromo.discountValue) / 100;
                            if (appliedPromo.maxDiscount !== null && discountTotal > appliedPromo.maxDiscount) {
                                discountTotal = appliedPromo.maxDiscount;
                            }
                        } else {
                            discountTotal = appliedPromo.discountValue;
                        }
                        if (discountTotal > totalSubtotal) {
                            discountTotal = totalSubtotal;
                        }
                        discountTotal = Math.round(discountTotal);
                    }
                }
            }
        }

        const finalTotalPayable = totalSubtotal + DELIVERY_FEE - discountTotal;
        const receipt = `foodio_${Date.now()}`;
        const razorpayOrder = await createRazorpayOrder(finalTotalPayable, receipt);

        const savedOrders = [];
        // Save a separate order for each restaurant group
        for (const [rId, group] of Object.entries(groups)) {
            const groupSubtotal = group.items.reduce((total, item) => total + item.price * item.quantity, 0);
            const groupDiscountShare = totalSubtotal > 0 ? Math.round((groupSubtotal / totalSubtotal) * discountTotal) : 0;
            const amount = groupSubtotal + DELIVERY_FEE - groupDiscountShare;
            
            const newOrder = new orderModel({
                userId: req.body.userId,
                items: group.items,
                amount,
                address: req.body.address,
                paymentMethod: "razorpay",
                status: "Order Confirmed",
                statusHistory: [{ status: "Order Confirmed", updatedAt: new Date() }],
                razorpayOrderId: razorpayOrder.id,
                restaurantId: rId,
                restaurantName: group.name,
                promoCode: appliedPromo ? appliedPromo.code : null,
                discountAmount: groupDiscountShare
            });
            await newOrder.save();
            savedOrders.push(newOrder);
        }

        res.json({
            success: true,
            key: process.env.RAZORPAY_KEY_ID,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            razorpayOrderId: razorpayOrder.id,
            localOrderId: savedOrders[0]?._id
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message || "Error creating payment" });
    }
};

const placeCodOrder = async (req, res) => {
    try {
        const items = req.body.items;
        if (!items || items.length === 0 || !req.body.address) {
            return res.status(400).json({ success: false, message: "Cart and delivery details are required" });
        }

        // Group items by restaurantId
        const groups = {};
        for (const item of items) {
            const food = await foodModel.findById(item._id);
            const rId = food ? (food.restaurantId || "green-garden") : "green-garden";
            const rName = food ? (food.restaurantName || "Green Garden Kitchen") : "Green Garden Kitchen";
            const foodPrice = food ? food.price : item.price;

            if (!groups[rId]) {
                groups[rId] = {
                    name: rName,
                    items: []
                };
            }
            groups[rId].items.push({
                ...item,
                price: foodPrice
            });
        }

        const totalSubtotal = items.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0);

        // Re-validate and calculate promo discount securely
        let discountTotal = 0;
        let appliedPromo = null;
        if (req.body.promoCode) {
            appliedPromo = await promoModel.findOne({ code: req.body.promoCode.toUpperCase().trim() });
            if (appliedPromo && appliedPromo.isActive && new Date(appliedPromo.expiryDate) >= new Date()) {
                const userCount = appliedPromo.userUsage ? (appliedPromo.userUsage.get(req.body.userId) || 0) : 0;
                if ((appliedPromo.usageLimit === null || appliedPromo.usageCount < appliedPromo.usageLimit) && 
                    (appliedPromo.userUsageLimit === null || userCount < appliedPromo.userUsageLimit)) {
                    
                    if (totalSubtotal >= appliedPromo.minOrderValue) {
                        if (appliedPromo.discountType === "percentage") {
                            discountTotal = (totalSubtotal * appliedPromo.discountValue) / 100;
                            if (appliedPromo.maxDiscount !== null && discountTotal > appliedPromo.maxDiscount) {
                                discountTotal = appliedPromo.maxDiscount;
                            }
                        } else {
                            discountTotal = appliedPromo.discountValue;
                        }
                        if (discountTotal > totalSubtotal) {
                            discountTotal = totalSubtotal;
                        }
                        discountTotal = Math.round(discountTotal);
                    }
                }
            }
        }

        // Save a separate order for each restaurant group
        for (const [rId, group] of Object.entries(groups)) {
            const groupSubtotal = group.items.reduce((total, item) => total + item.price * item.quantity, 0);
            const groupDiscountShare = totalSubtotal > 0 ? Math.round((groupSubtotal / totalSubtotal) * discountTotal) : 0;
            const amount = groupSubtotal + DELIVERY_FEE - groupDiscountShare;
            
            const newOrder = new orderModel({
                userId: req.body.userId,
                items: group.items,
                amount,
                address: req.body.address,
                paymentMethod: "cod",
                status: "Order Confirmed",
                statusHistory: [{ status: "Order Confirmed", updatedAt: new Date() }],
                restaurantId: rId,
                restaurantName: group.name,
                promoCode: appliedPromo ? appliedPromo.code : null,
                discountAmount: groupDiscountShare
            });
            await newOrder.save();
        }

        // Increment usage count for COD instantly
        if (appliedPromo) {
            appliedPromo.usageCount += 1;
            const currentUsage = appliedPromo.userUsage ? (appliedPromo.userUsage.get(req.body.userId) || 0) : 0;
            if (!appliedPromo.userUsage) {
                appliedPromo.userUsage = new Map();
            }
            appliedPromo.userUsage.set(req.body.userId, currentUsage + 1);
            await appliedPromo.save();
        }

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
        
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const receivedSignature = Buffer.from(razorpay_signature || "");
        const expectedSignatureBuffer = Buffer.from(expectedSignature);
        const isValid = receivedSignature.length === expectedSignatureBuffer.length
            && crypto.timingSafeEqual(expectedSignatureBuffer, receivedSignature);
        if (!isValid) return res.status(400).json({ success: false, message: "Payment verification failed" });

        // Retrieve the order to check for applied promo code before updating
        const firstOrder = await orderModel.findOne({ razorpayOrderId: razorpay_order_id });
        if (firstOrder && firstOrder.promoCode) {
            const promo = await promoModel.findOne({ code: firstOrder.promoCode.toUpperCase().trim() });
            if (promo) {
                promo.usageCount += 1;
                const currentUsage = promo.userUsage ? (promo.userUsage.get(req.body.userId) || 0) : 0;
                if (!promo.userUsage) {
                    promo.userUsage = new Map();
                }
                promo.userUsage.set(req.body.userId, currentUsage + 1);
                await promo.save();
            }
        }

        // Update all orders with this razorpayOrderId as paid
        await orderModel.updateMany(
            { razorpayOrderId: razorpay_order_id },
            { $set: { payment: true, razorpayPaymentId: razorpay_payment_id } }
        );

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
const listOrders = async(req,res)=>{
    try {
        const orders=await orderModel.find({});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
};

// update order status (admin / restaurant / delivery)
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

// Get all incoming orders (unassigned and not rejected by the current delivery partner)
const getIncomingOrders = async (req, res) => {
    try {
        const deliveryPartnerId = req.body.userId;
        const orders = await orderModel.find({
            deliveryPartnerId: null,
            status: { $nin: ["Delivered"] },
            rejectedBy: { $ne: deliveryPartnerId }
        });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching incoming orders" });
    }
};

// Accept an order (delivery partner)
const acceptOrder = async (req, res) => {
    try {
        const deliveryPartnerId = req.body.userId;
        const { orderId } = req.body;
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }
        if (order.deliveryPartnerId) {
            return res.json({ success: false, message: "Order already accepted by another partner" });
        }
        order.deliveryPartnerId = deliveryPartnerId;
        order.status = "Accepted";
        order.statusHistory = [...(order.statusHistory || []), { status: "Accepted", updatedAt: new Date() }];
        await order.save();
        res.json({ success: true, message: "Order accepted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error accepting order" });
    }
};

// Decline/reject an order (delivery partner)
const declineOrder = async (req, res) => {
    try {
        const deliveryPartnerId = req.body.userId;
        const { orderId } = req.body;
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }
        if (!order.rejectedBy.includes(deliveryPartnerId)) {
            order.rejectedBy.push(deliveryPartnerId);
            await order.save();
        }
        res.json({ success: true, message: "Order declined" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error declining order" });
    }
};

// List active deliveries for the delivery partner
const getActiveDeliveries = async (req, res) => {
    try {
        const deliveryPartnerId = req.body.userId;
        const orders = await orderModel.find({
            deliveryPartnerId: deliveryPartnerId,
            status: { $ne: "Delivered" }
        });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching active deliveries" });
    }
};

// List delivery history for the delivery partner
const getDeliveryHistory = async (req, res) => {
    try {
        const deliveryPartnerId = req.body.userId;
        const orders = await orderModel.find({
            deliveryPartnerId: deliveryPartnerId,
            status: "Delivered"
        });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching delivery history" });
    }
};

// Get restaurant active/incoming orders
const getRestaurantIncomingOrders = async (req, res) => {
    try {
        const restaurantId = req.body.userId;
        const orders = await orderModel.find({
            restaurantId: restaurantId,
            status: { $in: ["Order Confirmed", "Accepted", "Preparing your food", "Ready for pickup"] }
        });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching incoming restaurant orders" });
    }
};

// Get restaurant completed/past orders (picked up or delivered)
const getRestaurantPastOrders = async (req, res) => {
    try {
        const restaurantId = req.body.userId;
        const orders = await orderModel.find({
            restaurantId: restaurantId,
            status: { $in: ["Out for Delivery", "Delivered"] }
        });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching past restaurant orders" });
    }
};

export { 
    placeOrder, 
    placeCodOrder, 
    verifyPayment, 
    userOrders, 
    listOrders, 
    updateStatus, 
    getIncomingOrders, 
    acceptOrder, 
    declineOrder, 
    getActiveDeliveries, 
    getDeliveryHistory,
    getRestaurantIncomingOrders,
    getRestaurantPastOrders
};
