
import AppError from "src/utils/AppError.js";
import { approvalStatusEnum, type IUser } from "../types/user.model.type.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";

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
            STATUSCODE.FORBIDDEN,
            ERROR_CODE.ACCOUNT_PENDING_APPROVAL,
            [
                {
                    path: "email",
                    message: "Your account has not been reviewed or approved yet"
                }
            ],
        );
    }

    // ✅ Banned account
    if (user.isBanned) {
        throw new AppError(
            "Your account has been suspended",
            STATUSCODE.FORBIDDEN,
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
