import VerifySignUpOtpPage from "@/components/pages/Auth/verifySignUpOtpPage";
import APP_info from "@/lib/constants/app_info";;

export const metadata = {
    title: `Verify OTP | ${APP_info.NAME}`,
    description: "Verify your email with the OTP sent to you."
};


export default function Page() {
    return <VerifySignUpOtpPage />;
}





