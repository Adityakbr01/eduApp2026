import VerifySignUpOtpPage from "@/components/pages/Auth/VerifySignUpOtpPage";
import APP_INFO from "@/lib/CONSTANTS/APP_INFO";

export const metadata = {
    title: `Verify OTP | ${APP_INFO.NAME}`,
    description: "Verify your email with the OTP sent to you."
};


export default function Page() {
    return <VerifySignUpOtpPage />;
}





