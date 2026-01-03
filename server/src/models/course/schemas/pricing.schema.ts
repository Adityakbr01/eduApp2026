import { Schema } from "mongoose";
import type { IDiscountCode } from "../../../types/course.type.js";
import { Currency } from "../../../types/course.type.js";

// Course Perk Schema (e.g., "Language: Hinglish", "Duration: 40+ Hours")
export const CoursePerkSchema = new Schema(
    {
        key: { type: String, required: true },
        value: { type: String, required: true },
        icon: { type: String },
    },
    { _id: false }
);

// Discount Code Schema
export const DiscountCodeSchema = new Schema<IDiscountCode>(
    {
        code: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        discountPercentage: {
            type: Number,
            required: true,
            min: 1,
            max: 90,
        },
        maxUses: { type: Number },
        currentUses: { type: Number, default: 0 },
        validFrom: { type: Date, required: true },
        validTill: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
    },
    { _id: true }
);

// Pricing Schema
export const PricingSchema = new Schema(
    {
        originalPrice: { type: Number, required: true, min: 0 },
        discountPercentage: { type: Number, default: 0, min: 0, max: 90 },
        finalPrice: { type: Number, default: 0, min: 0 },
        currency: {
            type: String,
            enum: Object.values(Currency),
            default: Currency.INR,
        },
        isGstApplicable: { type: Boolean, default: true },
        gstPercentage: { type: Number, default: 18, min: 0 },
    },
    { _id: false }
);
