import { Schema, model } from "mongoose";

const permissionSchema = new Schema(
    {
        code: { type: String, unique: true, required: true }, // e.g "READ_USER" 
        description: String, // e.g "Permission to read user data"
    },
    { timestamps: true }
);

export const PermissionModel = model("Permission", permissionSchema);
