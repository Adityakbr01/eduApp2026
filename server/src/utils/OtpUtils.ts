import bcrypt from "bcryptjs";

export const generateOtp = async () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    return { otp, hashedOtp, expiry };
};

export const verifyOtpHash = async (plainOtp: string, hashedOtp: string) => {
    return bcrypt.compare(plainOtp, hashedOtp);
};
