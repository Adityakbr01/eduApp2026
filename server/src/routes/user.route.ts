import { Router } from "express";
import { PERMISSIONS } from "src/constants/permissions.js";
import { ROLES } from "src/constants/roles.js";
import userController from "src/controllers/user.controller.js";
// import { validateSchema } from "src/middlewares/custom/validateSchema.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import checkPermission from "src/middlewares/system/checkPermission.js";
import checkRole from "src/middlewares/system/checkRole.js";
// import { updateUserSchema } from "src/validators/index.js";
const router = Router();


router.use(authMiddleware);
//Manage Permissions and Assign Roles
//@desc GET ROLES AND PERMISSIONS
//todo remove unnecessary roles
router.get("/getAllRoleANDPermission", checkRole(ROLES.ADMIN.code, ROLES.MANAGER.code), userController.getAllRoleANDPermission);
router.get("/getMyRoleANDPermission", userController.getMyRoleANDPermission);
// //@desc ASSIGN PERMISSIONS
router.post("/roles-permissions", checkRole(ROLES.ADMIN.code, ROLES.MANAGER.code), checkPermission(PERMISSIONS.MANAGE_PERMISSIONS.code), userController.assignPermissions);
// @desc DELETE PERMISSIONS
router.delete("/roles-permissions", checkRole(ROLES.ADMIN.code, ROLES.MANAGER.code), checkPermission(PERMISSIONS.MANAGE_PERMISSIONS.code), userController.deletePermissions);
// //@desc APPROVE USER,  
router.post("/approved-user/:id", checkRole(ROLES.ADMIN.code, ROLES.MANAGER.code), checkPermission(PERMISSIONS.MANAGE_USER.code), userController.approveUser);
// //@ban USER ,  
router.post("/user-ban-unban/:id", checkRole(ROLES.ADMIN.code, ROLES.MANAGER.code), checkPermission(PERMISSIONS.MANAGE_USER.code), userController.toggleUserStatus);
// //Todo : --> add assign permission

// CRUD Users
router.get("/", checkRole(ROLES.ADMIN.code, ROLES.MANAGER.code, ROLES.INSTRUCTOR.code), checkPermission(PERMISSIONS.READ_USERS.code), userController.getAllUsers);
// router.get("/:id", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPPORT), checkPermission(PERMISSIONS.USER_READ), userController.getUserById);
// router.put("/:id", validateSchema(updateUserSchema), checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPPORT), checkPermission(PERMISSIONS.USER_UPDATE), userController.updateUserById);
router.delete("/:id", checkRole(ROLES.ADMIN.code, ROLES.MANAGER.code, ROLES.INSTRUCTOR.code), checkPermission(PERMISSIONS.DELETE_USER.code), userController.deleteUserById);

export default router;