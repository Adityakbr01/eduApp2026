import type { Types } from "mongoose";
import { ROLES } from "src/constants/roles.js";
import { RoleModel } from "src/models/role.model.js";
import User from "src/models/user.model.js";
import type { PopulatedRole, UserWithRole } from "src/types/auth.type.js";
import type { IUser } from "src/types/user.model.type.js";
export const authRepository = {
    findUserByEmailOrPhone: async (email: string, phone?: string) => {
        const orConditions: any[] = [{ email }];
        if (phone) orConditions.push({ phone });

        return User.findOne({ $or: orConditions });
    },

    findUserByEmailWithOtp: async (email: string) => {
        return User.findOne({ email }).select(
            "+verifyOtp +verifyOtpExpiry +approvalStatus +password"
        );
    },

    findUserForLogin: async (email: string) => {
        return User.findOne({ email }).select(
            "+password +isEmailVerified +isBanned +approvalStatus +permissions +roleId"
        )
    },

    findUserByIdWithPassword: async (userId: string) => {
        return User.findById(userId).select(
            "+password +isEmailVerified +isBanned +approvalStatus"
        );
    },

    createUser: async (data: any) => {
        return User.create(data);
    },

    updateOtpByEmail: async (email: string, otp: string, expiry: Date) => {
        return User.updateOne(
            { email },
            { verifyOtp: otp, verifyOtpExpiry: expiry }
        );
    },

    saveUser: async (user: any) => {
        return user.save();
    },

    findRoleByName: async (role: string) => {
        return RoleModel.findOne({ name: role });
    },

    findUserMinimalById: async (userId: string) => {
        return User.findById(userId)
            .select("name email roleId isEmailVerified approvalStatus isBanned phone permissions")
            .populate<{ roleId: PopulatedRole }>("roleId", "name")
            .lean<UserWithRole>()
    },
    findUserById: async (userId: string) => {
        return User.findById(userId).exec();
    },
    isAdminUser: async (user: any): Promise<boolean> => {
        if (!user?.roleId) return false;

        const role = await RoleModel.findById(user.roleId).exec();
        return role?.name === ROLES.ADMIN.code;
    },
    getRoleNameById: async (roleId: Types.ObjectId): Promise<string | null> => {
        const role = await RoleModel.findById(roleId).exec();
        return role ? role.name : null;
    },
}