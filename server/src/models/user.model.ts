import bcrypt from "bcryptjs";
import type { Secret, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { Schema, model } from "mongoose";
import { ROLES, type Role } from "../constants/roles.js";
import { RoleModel as RoleSchema } from "./role.model.js";
import { env } from "src/configs/env.js";
import { approvalStatusEnum, ProfessionEnum, type IUser } from "src/types/user.model.type.js";
import { PermissionModel } from "./permission.model.js";
import type { PermissionDTO } from "src/types/auth.type.js";

// Reusable schema for versioned assets (avatar, resume, etc.)
const versionedAssetSchema = new Schema({
    key: { type: String, required: true },
    version: { type: Number, required: true, default: 1 },
    updatedAt: { type: Date, default: Date.now },
}, { _id: false });

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

const userSchema = new Schema<IUser>(
    {
        //! Basic Information for all roles
        name: { type: String, required: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true, select: false },


        roleId: {
            type: Schema.Types.ObjectId, ref: "Role",
            required: true,
        },

        isEmailVerified: { type: Boolean, default: false },

        //! Contact Information
        phone: {
            type: String, unique: true,
            sparse: true,
            required: false
        },
        address: {
            type: String,
            required: false,
            select: false,
        },

        //! User Profile (personal, location, professional info)
        profile: {
            type: userProfileSchema,
            default: () => ({}),
        },

        // Approval Flow
        approvalStatus: {
            type: String,
            enum: approvalStatusEnum,
            default: approvalStatusEnum.PENDING, // will be overridden for student/admin
        },


        approvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },

        // Specific Permissions beyond role-based permissions (rarely used)
        permissions: [
            {
                type: Schema.Types.ObjectId,
                ref: "Permission"
            }
        ]
        ,
        //! Global Flags
        isBanned: { type: Boolean, default: false },
        bannedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },

        //! Instructor Profile (only create for instructor users)
        instructorProfile: {
            // Prevent automatic _id for nested schema
            type: new Schema({
                bio: String,
                expertise: [String],
                experience: Number,
            }, { _id: false }),

            // Do NOT create by default
            default: undefined,

            // Do not show unless asked
            select: false
        },

        //! Student Profile (only for student users)
        studentProfile: {
            type: new Schema({
                enrolledCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
                progress: { type: Map, of: Number },
            }, { _id: false }),

            default: undefined
        },

        //! Manager Profile (only for manager users)
        managerProfile: {
            type: new Schema({
                department: String,
                teamSize: Number,
            }, { _id: false }),

            default: undefined,
            select: false
        },

        //! Support Team Profile (only for support users)
        supportTeamProfile: {
            type: new Schema({
                shiftTimings: String,
                expertiseAreas: [String],
            }, { _id: false }),

            default: undefined,
            select: false
        },

    },
    { timestamps: true }
);

// set approvalStatus based on role
userSchema.pre("save", async function (next) {
    if (!this.isModified("roleId")) return next();

    const role = await RoleSchema.findById(this.roleId).select("name").lean();
    if (!role) return next();

    const autoApprovedRoles: Role[] = [ROLES.STUDENT.code];

    if (autoApprovedRoles.includes(role.name as Role)) {
        this.approvalStatus = approvalStatusEnum.APPROVED;
    } else {
        this.approvalStatus = approvalStatusEnum.PENDING;
    }

    next();
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (plainPassword: string) {
    return bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.generateAccessToken = async function (
    sessionId: string,
) {

    const role = await RoleSchema.findById(this.roleId).select("name").lean();
    return jwt.sign(
        {
            userId: this._id,
            roleId: this.roleId,
            roleName: role.name,
            sessionId,
        },
        env.JWT_ACCESS_TOKEN_SECRET,
        {
            expiresIn: env.JWT_ACCESS_TOKEN_EXPIRES_IN,
        } as SignOptions
    );
};


const UserModel = model("User", userSchema);


export default UserModel;