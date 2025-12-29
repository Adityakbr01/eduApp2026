// src/seeds/seedRolesAndPermissions.ts
import mongoose from "mongoose";
import { env } from "src/configs/env.js";
import { PERMISSIONS } from "src/constants/permissions.js";
import { DEFAULT_ROLE_PERMISSIONS } from "src/constants/rolePermissions.js";
import { ROLES } from "src/constants/roles.js";
import { PermissionModel } from "src/models/permission.model.js";
import { RoleModel } from "src/models/role.model.js";
import { RolePermissionModel } from "src/models/rolePermission.model.js";
import logger from "src/utils/logger.js";

async function seed() {
    try {
        await mongoose.connect(env.MONGO_URI);
        logger.info("🟢 MongoDB connected for seeding...");

        // 1️⃣ Create Roles
        const roleDocs = [];
        for (const roleKey of Object.keys(ROLES)) {
            const roleInfo = ROLES[roleKey as keyof typeof ROLES];
            let role = await RoleModel.findOne({ name: roleInfo.code });
            if (!role) {
                role = await RoleModel.create({
                    name: roleInfo.code,
                    description: roleInfo.description
                });
                logger.info(`✅ Role created: ${roleInfo.code}`);
            }
            roleDocs.push(role);
        }


        // 2️⃣ Create Permissions
        const permissionDocs: Record<string, any> = {};
        for (const perm of Object.values(PERMISSIONS)) {
            let permission = await PermissionModel.findOne({ code: perm.code });
            if (!permission) {
                permission = await PermissionModel.create({ code: perm.code, description: perm.description });
                logger.info(`✅ Permission created: ${perm.code}`);
            }
            permissionDocs[perm.code] = permission;
        }

        // 3️⃣ Assign default permissions to roles
        for (const role of roleDocs) {
            const permissionsForRole = DEFAULT_ROLE_PERMISSIONS[role.name] || [];
            for (const permCode of permissionsForRole) {
                const perm = permissionDocs[permCode];
                if (!perm) continue;

                const exists = await RolePermissionModel.findOne({
                    roleId: role._id,
                    permissionId: perm._id,
                });
                if (!exists) {
                    await RolePermissionModel.create({
                        roleId: role._id,
                        permissionId: perm._id,
                    });
                    logger.info(`🔹 Assigned permission ${perm.code} to role ${role.name}`);
                }
            }
        }

        logger.info("🎉 Roles and permissions seeding completed successfully!");
        process.exit(0);
    } catch (err) {
        logger.error("❌ Error seeding roles & permissions:", err);
        process.exit(1);
    }
}

seed();
