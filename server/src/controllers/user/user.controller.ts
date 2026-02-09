import { STATUSCODE } from "src/constants/statusCodes.js";
import { SUCCESS_CODE } from "src/constants/successCodes.js";
import userService from "src/services/user/users.service.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";

const userController = {
    //Adding pagination now
    getAllUsers: catchAsync(async (req, res) => {
        const result = await userService.getAllUsers(req.query);
        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, {
            users: result.users,
            pagination: result.pagination
        });
    }),
    getMyRoleANDPermission: catchAsync(async (req, res) => {
        if (!req.user?.id) {
            return sendResponse(res, STATUSCODE.UNAUTHORIZED, "Unauthorized");
        }
        const result = await userService.getMyRoleANDPermission(req.user!.id);
        sendResponse(res, 200, "User roles and permissions fetched successfully", {
            message: result.message,
            customPermissions: result.customPermissions,
            rolePermissions: result.rolePermissions,
            effectivePermissions: result.effectivePermissions,
        });
    }),
    // getUserById: catchAsync(async (req, res) => {
    //     const userId = req.params.id;
    //     const result = await userService.getUserById(userId);
    //     sendResponse(res, 200, "User fetched successfully", result);
    // }),
    // updateUserById: (async (req, res) => {
    //     const userId = req.params.id;
    //     const result = await userService.updateUserById(userId, req.body);
    //     sendResponse(res, 200, "User updated successfully", {
    //         message: result.message,
    //         data: result.data,
    //     });
    // }),
    deleteUserById: catchAsync(async (req, res) => {
        const userId = req.params.id;
        const deleteBy = req.user!.id;
        const result = await userService.deleteUserById(userId, deleteBy);
        sendResponse(res, 200, result.message, result.data);
    }),

    // Roles and Permissions
    getAllRoleANDPermission: catchAsync(async (req, res) => {
        const result = await userService.getAllRoleANDPermission();
        sendResponse(res, 200, "Roles and permissions fetched successfully", {
            message: result.message,
            data: result.data,
        });
    }),
    assignPermissions: catchAsync(async (req, res) => {
        const assignBy = req.user!.id;
        const result = await userService.assignPermissions({ ...req.body }, assignBy);
        sendResponse(res, 200, result.message, result.data);
    }),
    deletePermissions: catchAsync(async (req, res) => {
        const deleteBy = req.user!.id;
        const result = await userService.deletePermissions({ ...req.body }, deleteBy);
        sendResponse(res, 200, result.message, result.data);
    }),
    approveUser: catchAsync(async (req, res) => {
        const userId = req.params.id;
        const result = await userService.approveUser(userId, req.user!.id);
        sendResponse(res, 200, "User approved successfully", {
            message: result.message,
            data: result.data,
        });
    }),
    toggleUserStatus: catchAsync(async (req, res) => {
        const userId = req.params.id;
        const result = await userService.toggleUserStatus(userId, req.user!.id, { banEmail: true });
        sendResponse(res, 200, result.message, result.data);
    }),
};

export default userController;