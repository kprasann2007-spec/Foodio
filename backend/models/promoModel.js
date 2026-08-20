import mongoose from "mongoose";

const promoSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: null }, // relevant for percentage discounts
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number, default: null }, // overall usage limit
    usageCount: { type: Number, default: 0 },
    userUsageLimit: { type: Number, default: 1 }, // limit per user
    userUsage: { type: Map, of: Number, default: {} }, // map of userId -> usage count
    applicableRestaurants: { type: [String], default: [] } // empty means applicable to all
});

const promoModel = mongoose.models.promo || mongoose.model("promo", promoSchema);
export default promoModel;
