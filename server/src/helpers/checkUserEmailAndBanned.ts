
import AppError from "src/utils/AppError.js";
import { approvalStatusEnum, type IUser } from "../types/user.model.type.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import path from "path";

function CheckUserEmailAndBanned(user: IUser) {

    // ✅ User does not exist
    if (!user) {
        throw new AppError(
            "Account not found",
            STATUSCODE.NOT_FOUND,
            ERROR_CODE.NOT_FOUND,
            [
                {
                    path: "email",
                    message: "No account exists with the provided email address"
                }
            ],
        );
    }



    // ✅ Account pending approval
    if (!user.approvalStatus || user.approvalStatus === approvalStatusEnum.PENDING) {
        throw new AppError(
            "Your account is awaiting for approval",
            STATUSCODE.BAD_REQUEST,
            ERROR_CODE.ACCOUNT_PENDING_APPROVAL,
            [
                {
                    path: "email",
                    message: "Your account has not been reviewed or approved yet"
                }
            ],
        );
    }

    if (user.approvalStatus === approvalStatusEnum.REJECTED) {
        throw new AppError(
            "Your account registration was rejected",
            STATUSCODE.BAD_REQUEST,
            ERROR_CODE.ACCOUNT_REGISTRATION_REJECTED,
            [
                {
                    path: "email",
                    message: "Your account registration was rejected. Please contact support for more information."
                }
            ],
        );
    }



    // ✅ Banned account
    if (user.isBanned) {
        throw new AppError(
            "Your account has been suspended",
            STATUSCODE.BAD_REQUEST,
            ERROR_CODE.FORBIDDEN,
            [
                {
                    path: "email",
                    message: "This email is linked to a suspended account"
                }
            ],
        );
    }
}

export default CheckUserEmailAndBanned;
