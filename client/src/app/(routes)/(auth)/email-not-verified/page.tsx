import APP_info from "@/constants/app_info";
import VerifyEmailOtpForm from "@/features/auth/Forms/VerifyEmailOtpForm";

export const metadata = {
  title: `Verify OTP | ${APP_info.NAME}`,
  description: "Verify your email with the OTP sent to you.",
};

export default function Page() {
  return <VerifyEmailOtpForm />;
}
