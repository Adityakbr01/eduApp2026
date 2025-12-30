import { EMAIL_TYPES, type EmailType }
    from "src/constants/email-types.constants.js";

export const templates: Record<EmailType, any> = {
    [EMAIL_TYPES.VERIFY_OTP]: (data: any) => ({
        subject: "Verify Your Email Address",
        text: `Your verification code is ${data.otp}. It expires in 5 minutes.`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Verify Your Email</title>
                <style>
                    body { margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
                    table { border-collapse: collapse; }
                    @media (max-width: 600px) { .container { width: 100% !important; padding: 16px !important; } }
                </style>
            </head>
            <body style="margin:0; padding:0; background:#f4f4f7;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table class="container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="width: 600px; max-width: 100%; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
                                <tr>
                                    <td style="padding: 48px 40px; text-align: center;">
                                        <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #1f2937;">Verify Your Email</h1>
                                        <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                                            We've generated a secure verification code for you. Please use it to complete your email verification.
                                        </p>
                                        <div style="background: #eff6ff; padding: 32px; border-radius: 10px; border-left: 5px solid #3b82f6; margin: 32px 0;">
                                            <p style="margin: 0; font-size: 36px; font-weight: 800; color: #1d4ed8; letter-spacing: 8px; line-height: 1;">${data.otp}</p>
                                            <p style="margin: 12px 0 0; font-size: 14px; color: #64748b; text-align: center;">This code expires in 5 minutes</p>
                                        </div>
                                        <p style="margin: 0; font-size: 14px; color: #9ca3af;">
                                            If you didn't request this code, you can safely ignore this email.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 24px; background: #f9fafb; text-align: center;">
                                        <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                                            © ${new Date().getFullYear()} Your Company. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
    }),

    [EMAIL_TYPES.LOGIN_OTP]: (data: any) => ({
        subject: "Your Login Security Code",
        text: `Your login code is ${data.otp}. It is valid for 5 minutes only.`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Login Security Code</title>
                <style>
                    body { margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
                    table { border-collapse: collapse; }
                    @media (max-width: 600px) { .container { width: 100% !important; padding: 16px !important; } }
                </style>
            </head>
            <body style="margin:0; padding:0; background:#f4f4f7;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table class="container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="width: 600px; max-width: 100%; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
                                <tr>
                                    <td style="padding: 48px 40px; text-align: center;">
                                        <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #1f2937;">Login Security Code</h1>
                                        <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                                            We noticed a login attempt on your account. Use the code below to securely complete the login.
                                        </p>
                                        <div style="background: #fff7ed; padding: 32px; border-radius: 10px; border-left: 5px solid #f97316; margin: 32px 0;">
                                            <p style="margin: 0; font-size: 36px; font-weight: 800; color: #ea580c; letter-spacing: 8px; line-height: 1;">${data.otp}</p>
                                            <p style="margin: 12px 0 0; font-size: 14px; color: #64748b; text-align: center;">Valid for 5 minutes only</p>
                                        </div>
                                        <p style="margin: 0; font-size: 14px; color: #9ca3af;">
                                            Never share this code with anyone — our team will never ask for it.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 24px; background: #f9fafb; text-align: center;">
                                        <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                                            © ${new Date().getFullYear()} Your Company. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
    }),

    [EMAIL_TYPES.WELCOME]: (data: any) => ({
        subject: "Welcome to Your Company!",
        text: `Welcome ${data.name}! Your account is ready to use.`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Welcome!</title>
                <style>
                    body { margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
                    table { border-collapse: collapse; }
                    @media (max-width: 600px) { .container { width: 100% !important; padding: 16px !important; } }
                </style>
            </head>
            <body style="margin:0; padding:0; background:#f4f4f7;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table class="container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="width: 600px; max-width: 100%; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
                                <tr>
                                    <td style="padding: 48px 40px; text-align: center;">
                                        <h1 style="margin: 0 0 16px; font-size: 32px; font-weight: 700; color: #1f2937;">Welcome Aboard! 🎉</h1>
                                        <p style="margin: 0 0 16px; font-size: 18px; line-height: 1.6; color: #4b5563;">
                                            Hello <strong style="color: #3b82f6;">${data.name}</strong>,
                                        </p>
                                        <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                                            We're thrilled to have you join us. Your account is fully set up and ready for you to explore all the features we offer.
                                        </p>
                                        <div style="background: #f0fdf4; padding: 32px; border-radius: 10px; border-left: 5px solid #22c55e; margin: 32px 0;">
                                            <p style="margin: 0; font-size: 17px; font-weight: 600; color: #15803d; text-align: center;">
                                                Jump into your dashboard and discover everything waiting for you.
                                            </p>
                                        </div>
                                        <p style="margin: 0; font-size: 14px; color: #9ca3af;">
                                            Need assistance? Reply to this email or visit our help center.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 24px; background: #f9fafb; text-align: center;">
                                        <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                                            © ${new Date().getFullYear()} Your Company. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
    }),

    [EMAIL_TYPES.PASSWORD_RESET_OTP]: (data: any) => ({
        subject: "Password Reset Request",
        text: `Your password reset code is ${data.otp}. It expires in 5 minutes.`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Reset Your Password</title>
                <style>
                    body { margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
                    table { border-collapse: collapse; }
                    @media (max-width: 600px) { .container { width: 100% !important; padding: 16px !important; } }
                </style>
            </head>
            <body style="margin:0; padding:0; background:#f4f4f7;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table class="container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="width: 600px; max-width: 100%; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
                                <tr>
                                    <td style="padding: 48px 40px; text-align: center;">
                                        <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #1f2937;">Reset Your Password</h1>
                                        <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                                            We've generated a secure code to help you reset your password.
                                        </p>
                                        <div style="background: #eff6ff; padding: 32px; border-radius: 10px; border-left: 5px solid #3b82f6; margin: 32px 0;">
                                            <p style="margin: 0; font-size: 36px; font-weight: 800; color: #1d4ed8; letter-spacing: 8px; line-height: 1;">${data.otp}</p>
                                            <p style="margin: 12px 0 0; font-size: 14px; color: #64748b; text-align: center;">This code expires in 5 minutes</p>
                                        </div>
                                        <p style="margin: 0; font-size: 14px; color: #9ca3af;">
                                            If you didn't request a password reset, please ignore this email.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 24px; background: #f9fafb; text-align: center;">
                                        <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                                            © ${new Date().getFullYear()} Your Company. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
    }),

    [EMAIL_TYPES.USER_APPROVAL]: (data: { email: string; }) => ({
        subject: "Your Account Has Been Approved ✅",
        text: `Your account has been approved. You can now log in and access your dashboard.`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Account Approved</title>
                <style>
                    body { margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
                    table { border-collapse: collapse; }
                    @media (max-width: 600px) { .container { width: 100% !important; padding: 16px !important; } }
                </style>
            </head>
            <body style="margin:0; padding:0; background:#f4f4f7;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table class="container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="width: 600px; max-width: 100%; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
                                <tr>
                                    <td style="padding: 48px 40px; text-align: center;">
                                        <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #1f2937;">Account Approved 🎉</h1>
                                        <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                                            Hi <strong>${data.email}</strong>,
                                        </p>
                                        <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                                            Great news! Your account has been reviewed and successfully approved. You can now log in and start using your dashboard.
                                        </p>
                                        <div style="background: #f0fdf4; padding: 28px; border-radius: 10px; border-left: 5px solid #22c55e;">
                                            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #15803d;">
                                                Welcome to the platform — we're excited to have you!
                                            </p>
                                        </div>
                                        <p style="margin: 32px 0 0; font-size: 14px; color: #9ca3af;">
                                            If you have any questions, feel free to contact support.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 24px; background: #f9fafb; text-align: center;">
                                        <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                                            © ${new Date().getFullYear()} Your Company. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
    }),

    [EMAIL_TYPES.USER_BAN]: (data: { email: string; }) => ({
        subject: "Important: Your Account Has Been Suspended",
        text: `Your account has been suspended due to a violation of our terms. Please contact support if you believe this is an error.`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Account Suspended</title>
                <style>
                    body { margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
                    table { border-collapse: collapse; }
                    @media (max-width: 600px) { .container { width: 100% !important; padding: 16px !important; } }
                </style>
            </head>
            <body style="margin:0; padding:0; background:#f4f4f7;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table class="container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="width: 600px; max-width: 100%; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
                                <tr>
                                    <td style="padding: 48px 40px; text-align: center;">
                                        <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #1f2937;">Account Suspended</h1>
                                        <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                                            Hi <strong>${data.email}</strong>,
                                        </p>
                                        <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                                            We regret to inform you that your account has been suspended due to a violation of our terms of service.
                                        </p>
                                        <div style="background: #fef2f2; padding: 28px; border-radius: 10px; border-left: 5px solid #ef4444;">
                                            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #991b1b;">
                                                If you believe this is a mistake or would like to appeal, please reach out to our support team.
                                            </p>
                                        </div>
                                        <p style="margin: 32px 0 0; font-size: 14px; color: #9ca3af;">
                                            We're here to help if you need clarification.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 24px; background: #f9fafb; text-align: center;">
                                        <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                                            © ${new Date().getFullYear()} Your Company. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
    }),
};