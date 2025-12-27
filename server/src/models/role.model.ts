import { Schema, model } from "mongoose";

const roleSchema = new Schema(
    {
        name: { type: String, unique: true, required: true }, // admin, student, instructor
        description: String, // e.g "Administrator with full access"
    },
    { timestamps: true }
);
export const RoleModel = model("Role", roleSchema);
