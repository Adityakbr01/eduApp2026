import { Schema } from "mongoose";

// Reusable schema for versioned assets (avatar, resume, etc.)
const versionedAssetSchema = new Schema({
    key: { type: String, required: true },
    version: { type: Number, required: true, default: 1 },
    updatedAt: { type: Date, default: Date.now },
}, { _id: false });


export default versionedAssetSchema;