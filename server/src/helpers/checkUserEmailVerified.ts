import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import type { IUser } from "src/types/user.model.type.js";
import AppError from "src/utils/AppError.js";

const checkUserEmailVerified = (user: IUser) => {
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
            ]

        );
    }
    // ✅ Email not verified
    if (!user.isEmailVerified) {
        throw new AppError(
            "Email not verified",
            STATUSCODE.BAD_REQUEST,
            ERROR_CODE.EMAIL_NOT_VERIFIED,
            [
                {
                    path: "email",
                    message: "Please verify your email address to proceed"
                }
            ]
        );
    }

    // If all checks pass, return true
    return true;
}

export default checkUserEmailVerified;