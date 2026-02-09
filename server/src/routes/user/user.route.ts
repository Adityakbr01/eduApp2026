import { Router } from "express";
import { PERMISSIONS } from "src/constants/permissions.js";
import { ROLES } from "src/constants/roles.js";
import userController from "src/controllers/user/user.controller.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import checkPermission from "src/middlewares/system/checkPermission.js";
import checkRole from "src/middlewares/system/checkRole.js";
const router = Router();

//@desc This route for managing user roles and permissions,deleteUser,Ban/Unban/Approve by admin and manager
router.use(authMiddleware);
router.get("/getMyRoleANDPermission", userController.getMyRoleANDPermission);
router.use(checkRole(ROLES.ADMIN.code, ROLES.MANAGER.code));
router.get("/getAllRoleANDPermission", userController.getAllRoleANDPermission);
router.post("/roles-permissions", checkPermission(PERMISSIONS.MANAGE_PERMISSIONS.code), userController.assignPermissions);
router.delete("/roles-permissions", checkPermission(PERMISSIONS.MANAGE_PERMISSIONS.code), userController.deletePermissions);
router.post("/approved-user/:id", checkPermission(PERMISSIONS.MANAGE_USER.code), userController.approveUser);
router.post("/user-ban-unban/:id", checkPermission(PERMISSIONS.MANAGE_USER.code), userController.toggleUserStatus);
router.get("/", checkPermission(PERMISSIONS.READ_USERS.code), userController.getAllUsers);
router.delete("/:id", checkPermission(PERMISSIONS.DELETE_USER.code), userController.deleteUserById);

export default router;