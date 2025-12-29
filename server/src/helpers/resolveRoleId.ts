import { Types } from "mongoose";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import AppError from "src/utils/AppError.js";

const resolveRoleId = (role: any) => {
    if (!role) {
        throw new AppError("Role is undefined or null", STATUSCODE.BAD_REQUEST, ERROR_CODE.INVALID_INPUT, [{
            path: "roleId", message: "Role ID must be provided"
        }]
        );
    }

    if (role instanceof Types.ObjectId) {
        return role.toString();
    }

    if (typeof role === "string") {
        return role;
    }

    if (typeof role === "object") {
        if (role._id) return role._id.toString();
        if (role.id) return role.id.toString();
    }

    return String(role);
};

export default resolveRoleId;