import promoModel from "../models/promoModel.js";
import foodModel from "../models/foodModel.js";

// Create a new promo code
const createPromo = async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderValue, maxDiscount, expiryDate, usageLimit, userUsageLimit, applicableRestaurants } = req.body;
        
        const exists = await promoModel.findOne({ code: code.toUpperCase().trim() });
        if (exists) {
            return res.json({ success: false, message: "Promo code already exists" });
        }

        const newPromo = new promoModel({
            code: code.toUpperCase().trim(),
            discountType,
            discountValue: Number(discountValue),
            minOrderValue: Number(minOrderValue || 0),
            maxDiscount: maxDiscount ? Number(maxDiscount) : null,
            expiryDate: new Date(expiryDate),
            usageLimit: usageLimit ? Number(usageLimit) : null,
            userUsageLimit: userUsageLimit ? Number(userUsageLimit) : 1,
            applicableRestaurants: applicableRestaurants || []
        });

        await newPromo.save();
        res.json({ success: true, message: "Promo code created successfully", data: newPromo });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error creating promo code" });
    }
};

// Validate and calculate discount for a promo code
const validatePromo = async (req, res) => {
    try {
        const { code, items } = req.body;
        const userId = req.body.userId;

        if (!code || !items || !Array.isArray(items) || items.length === 0) {
            return res.json({ success: false, message: "Invalid request payload" });
        }

        const promo = await promoModel.findOne({ code: code.toUpperCase().trim() });
        if (!promo) {
            return res.json({ success: false, message: "Invalid promo code" });
        }

        if (!promo.isActive) {
            return res.json({ success: false, message: "Promo code is inactive" });
        }

        if (new Date(promo.expiryDate) < new Date()) {
            return res.json({ success: false, message: "Promo code has expired" });
        }

        if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
            return res.json({ success: false, message: "Promo code usage limit reached" });
        }

        // Check user usage limit
        const userCount = promo.userUsage ? (promo.userUsage.get(userId) || 0) : 0;
        if (promo.userUsageLimit !== null && userCount >= promo.userUsageLimit) {
            return res.json({ success: false, message: "You have exceeded the usage limit for this promo code" });
        }

        // Calculate subtotal of items
        let subtotal = 0;
        let eligibleSubtotal = 0;

        for (const item of items) {
            const food = await foodModel.findById(item._id);
            const price = food ? food.price : item.price;
            const itemTotal = price * item.quantity;
            subtotal += itemTotal;

            // Check if applicable restaurants constraint is met
            if (promo.applicableRestaurants.length === 0 || (food && promo.applicableRestaurants.includes(food.restaurantId))) {
                eligibleSubtotal += itemTotal;
            }
        }

        if (subtotal < promo.minOrderValue) {
            return res.json({ success: false, message: `Minimum order value of ₹${promo.minOrderValue} is required` });
        }

        if (eligibleSubtotal === 0) {
            return res.json({ success: false, message: "Promo code is not applicable to the items in your cart" });
        }

        // Calculate discount
        let discount = 0;
        if (promo.discountType === "percentage") {
            discount = (eligibleSubtotal * promo.discountValue) / 100;
            if (promo.maxDiscount !== null && discount > promo.maxDiscount) {
                discount = promo.maxDiscount;
            }
        } else {
            discount = promo.discountValue;
        }

        // Discount cannot exceed eligible subtotal
        if (discount > eligibleSubtotal) {
            discount = eligibleSubtotal;
        }

        res.json({
            success: true,
            message: "Promo code applied successfully",
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            discountAmount: Math.round(discount),
            minOrderValue: promo.minOrderValue
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error validating promo code" });
    }
};

// List active promo codes
const listPromos = async (req, res) => {
    try {
        const promos = await promoModel.find({
            isActive: true,
            expiryDate: { $gt: new Date() }
        });
        res.json({ success: true, data: promos });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error listing promo codes" });
    }
};

export { createPromo, validatePromo, listPromos };
