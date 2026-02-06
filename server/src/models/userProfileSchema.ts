import { Schema } from "mongoose";
import versionedAssetSchema from "./versionedAssetSchema.js";
import { ProfessionEnum } from "src/types/user.model.type.js";

// User profile schema
const userProfileSchema = new Schema({
    // Personal Info
    firstName: { type: String, maxlength: 50 },
    lastName: { type: String, maxlength: 50 },
    dateOfBirth: { type: Date },
    bio: { type: String, maxlength: 500 },
    avatar: { type: versionedAssetSchema, default: undefined },

    // Location
    city: { type: String, maxlength: 100 },
    state: { type: String, maxlength: 100 },
    country: { type: String, maxlength: 100 },

    // Professional
    profession: {
        type: String,
        enum: Object.values(ProfessionEnum),
        default: ProfessionEnum.STUDENT
    },
    organization: { type: String, maxlength: 200 },
    resume: { type: versionedAssetSchema, default: undefined },
    linkedinUrl: { type: String, maxlength: 200 },
    githubUrl: { type: String, maxlength: 200 },
}, { _id: false });


export default userProfileSchema;