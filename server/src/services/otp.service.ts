import { env } from "src/configs/env.js";
import { Resend } from "resend";

export enum EmailType {
    VERIFY_OTP = "VERIFY_OTP",
    LOGIN_OTP = "LOGIN_OTP",
    WELCOME = "WELCOME",
    PASSWORD_RESET_OTP = "PASSWORD_RESET_OTP",
    USER_APPROVAL = "USER_APPROVAL",
    USER_BAN = "USER_BAN",
}


type EmailPayload =
    | { email: string; otp?: string } // VERIFY_OTP, LOGIN_OTP
    | { email: string; name?: string } // WELCOME
    | { email: string; resetLink?: string }; // PASSWORD_RESET

// Initialize Resend client
const resend = new Resend(env.RESEND_API_KEY);

const templates = {
    [EmailType.VERIFY_OTP]: (data: any) => ({
        subject: "Verify Your Email",
        text: `Your verification OTP is ${data.otp}`,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; padding: 20px; background-color: #ffffff; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">Verify Your Email</h2>
                    <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">Your verification code has been generated securely. Use it to complete your email verification.</p>
                    <div style="background-color: #e3f2fd; padding: 20px; border-radius: 6px; border-left: 4px solid #2196f3; margin: 20px 0;">
                        <p style="font-size: 32px; font-weight: bold; color: #1976d2; letter-spacing: 4px; margin: 0; text-align: center;">${data.otp}</p>
                        <p style="color: #666666; margin: 10px 0 0 0; font-size: 14px; text-align: center;">Expires in 5 minutes</p>
                    </div>
                    <p style="color: #999999; font-size: 14px; margin: 20px 0 0 0; text-align: center;">If you didn't request this, please ignore this email.</p>
                </div>
            </div>
        `,
    }),
    [EmailType.LOGIN_OTP]: (data: any) => ({
        subject: "Login Security OTP",
        text: `Your login OTP is ${data.otp}`,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; padding: 20px; background-color: #ffffff; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">Login Security Code</h2>
                    <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">We've received a login attempt on your account. Use this one-time code to proceed securely.</p>
                    <div style="background-color: #fff3e0; padding: 20px; border-radius: 6px; border-left: 4px solid #ff9800; margin: 20px 0;">
                        <p style="font-size: 32px; font-weight: bold; color: #f57c00; letter-spacing: 4px; margin: 0; text-align: center;">${data.otp}</p>
                        <p style="color: #666666; margin: 10px 0 0 0; font-size: 14px; text-align: center;">Valid for 5 minutes only</p>
                    </div>
                    <p style="color: #999999; font-size: 14px; margin: 20px 0 0 0; text-align: center;">For your security, never share this code with anyone.</p>
                </div>
            </div>
        `,
    }),
    [EmailType.WELCOME]: (data: any) => ({
        subject: "Welcome!",
        text: `Welcome ${data.name}! Your account is ready.`,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; padding: 20px; background-color: #ffffff; border-radius: 8px; margin-bottom: 20px;">
                    <h1 style="color: #333333; margin: 0 0 15px 0; font-size: 32px; font-weight: 700;">Welcome Aboard! 🎉</h1>
                    <p style="color: #666666; margin: 0 0 20px 0; font-size: 18px; line-height: 1.5;">Hello <strong style="color: #1976d2;">${data.name}</strong>,</p>
                    <p style="color: #666666; margin: 0 0 30px 0; font-size: 16px; line-height: 1.5;">Your account is all set up and ready for you to dive in. We're excited to have you here!</p>
                    <div style="background-color: #e8f5e8; padding: 20px; border-radius: 6px; border-left: 4px solid #4caf50; margin: 20px 0;">
                        <p style="margin: 0; font-size: 16px; color: #2e7d32; text-align: center; font-weight: 500;">Start exploring your dashboard and unlock amazing features today.</p>
                    </div>
                    <p style="color: #999999; font-size: 14px; margin: 20px 0 0 0; text-align: center;">Need help? Reply to this email or check our support center.</p>
                </div>
            </div>
        `,
    }),
    [EmailType.PASSWORD_RESET_OTP]: (data: any) => ({
        subject: "Password Reset OTP",
        text: `Your password reset OTP is ${data.otp}`,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; padding: 20px; background-color: #ffffff; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                    <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">Your password reset code has been generated securely. Use it to complete your password reset.</p>
                    <div style="background-color: #e3f2fd; padding: 20px; border-radius: 6px; border-left: 4px solid #2196f3; margin: 20px 0;">
                        <p style="font-size: 32px; font-weight: bold; color: #1976d2; letter-spacing: 4px; margin: 0; text-align: center;">${data.otp}</p>
                        <p style="color: #666666; margin: 10px 0 0 0; font-size: 14px; text-align: center;">Expires in 5 minutes</p>
                    </div>
                    <p style="color: #999999; font-size: 14px; margin: 20px 0 0 0; text-align: center;">If you didn't request this, please ignore this email.</p>
                </div>
            </div>
        `,
    }),
    [EmailType.USER_APPROVAL]: (data: { email: string; }) => ({
        subject: "Your Account Has Been Approved ✅",
        text: `Your account has been approved. You can now log in and use your dashboard.`,
        html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  max-width: 600px; margin: 0 auto; padding: 20px;
                  background-color: #f9f9f9; border-radius: 8px;">
          
          <div style="background: #ffffff; border-radius: 8px; padding: 24px; 
                      box-shadow: rgba(0,0,0,0.05) 0px 2px 6px;">
              
              <h2 style="color: #333333; margin: 0 0 12px; font-size: 22px; font-weight: 600;">
                  Your Account Is Approved 🎉
              </h2>

              <p style="color: #555555; margin: 0 0 16px; line-height: 1.6; font-size: 15px;">
                  Hi <strong>${data.email}</strong>,<br />
                  Great news! Your account has been reviewed and approved.
              </p>

              <p style="color: #555555; margin: 0 0 20px; line-height: 1.6; font-size: 15px;">
                  You can now log in and start accessing your dashboard and available features.
              </p>

              <p style="color: #999999; font-size: 13px; margin-top: 24px; text-align: center;">
                  Approved on: ${Date.now().toLocaleString()}
              </p>

          </div>

          <p style="color: #aaaaaa; font-size: 12px; margin-top: 16px; text-align: center;">
              If you did not request this approval or need help, contact support.
          </p>
      </div>
  `,
    }),
    [EmailType.USER_BAN]: (data: { email: string; }) => ({
        subject: "Your Account Has Been Banned ❌",
        text: `Your account has been banned. If you believe this is a mistake, please contact support.`,
        html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  max-width: 600px; margin: 0 auto; padding: 20px;
                  background-color: #f9f9f9; border-radius: 8px;">
            <div style="background: #ffffff; border-radius: 8px; padding: 24px;
                        box-shadow: rgba(0,0,0,0.05) 0px 2px 6px;">
                <h2 style="color: #333333; margin: 0 0 12px; font-size: 22px; font-weight: 600;">
                    Your Account Has Been Banned
                </h2>
                <p style="color: #555555; margin: 0 0 16px; line-height: 1.6; font-size: 15px;">
                    Hi <strong>${data.email}</strong>,<br />
                    We regret to inform you that your account has been banned due to violations of our terms of service.
                </p>
                <p style="color: #555555; margin: 0 0 20px; line-height: 1.6; font-size: 15px;">
                    If you believe this action was taken in error or wish to appeal, please contact our support team for further assistance.
                </p>
                <p style="color: #999999; font-size: 13px; margin-top: 24px; text-align: center;">
                    Banned on: ${new Date().toLocaleString()}
                </p>
            </div>
            <p style="color: #aaaaaa; font-size: 12px; margin-top: 16px; text-align: center;">
                If you did not request this ban or need help, contact support.
            </p>
        </div>
  `,
    }),
};

const emailService = {
    sendEmail: async (type: EmailType, payload: EmailPayload) => {
        const template = templates[type];
        if (!template) throw new Error("Invalid email type");

        const { subject, text, html } = template(payload);

        try {
            const response = await resend.emails.send({
                from: "no-reply@edulaunch.shop", // must be your verified domain
                to: payload.email,
                subject,
                html,
            });

            console.log(`✅ Email sent to ${payload.email}:`);
        } catch (error) {
            console.error(`❌ Failed to send email to ${payload.email}:`, error);
            throw error;
        }

    },
};

export default emailService;
