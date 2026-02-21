import { Types } from "mongoose";
import { STATUSCODE } from "src/constants/statusCodes.js";
import UserModel from "src/models/user/user.model.js";
import AppError from "src/utils/AppError.js";

const resolveUserIdOrEmail = async (identifier?: string): Promise<string | undefined> => {
    if (!identifier) return undefined;

    if (identifier.includes("@")) {
        const user = await UserModel.findOne({ email: identifier.toLowerCase() }).select("_id").lean();
        if (!user) {
            throw new AppError(`User not found with email: ${identifier}`, STATUSCODE.NOT_FOUND);
        }
        return user._id.toString();
    }

    if (!Types.ObjectId.isValid(identifier)) {
        throw new AppError(`Invalid User ID format: ${identifier}`, STATUSCODE.BAD_REQUEST);
    }

    return identifier;
};


export default resolveUserIdOrEmail;