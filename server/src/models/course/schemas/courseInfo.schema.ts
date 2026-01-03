import { Schema } from "mongoose";


// Rating Schema
export const RatingSchema = new Schema(
    {
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        totalRatings: { type: Number, default: 0 },
        ratingDistribution: {
            five: { type: Number, default: 0 },
            four: { type: Number, default: 0 },
            three: { type: Number, default: 0 },
            two: { type: Number, default: 0 },
            one: { type: Number, default: 0 },
        },
    },
    { _id: false }
);
