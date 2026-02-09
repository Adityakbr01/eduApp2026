import { EMAIL_TYPES, type EmailType } from "src/constants/email-types.constants.js";
import app_info from "./app_info.js";

/* -------------------------------------------------------------------------- */
/*                              SHARED EMAIL THEME                             */
/* -------------------------------------------------------------------------- */

const brandPrimary = app_info.primaryColor || "#3b82f6";
const brandSecondary = app_info.secondaryColor || "#1d4ed8";

const emailTheme = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${app_info.name}</title>

<style>
/* ------------------------ CLIENT RESETS ------------------------ */
body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
img { -ms-interpolation-mode: bicubic; }
table { border-collapse: collapse !important; }
body { margin: 0 !important; padding: 0 !important; width: 100% !important; }

/* ------------------------ CSS VARIABLES ------------------------ */
:root {
  --brand-primary: ${brandPrimary};
  --brand-secondary: ${brandSecondary};
  --bg-light: #f4f4f7;
  --bg-card: #ffffff;
  --text-main: #1f2937;
  --text-muted: #6b7280;
  --border-soft: rgba(0,0,0,0.06);
}

/* ------------------------ BASE STYLES ------------------------ */
body {
  background-color: var(--bg-light);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, Helvetica, Arial, sans-serif;
  color: var(--text-main);
}

.container {
  width: 600px;
  max-width: 100%;
  background-color: var(--bg-card);
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.08);
  overflow: hidden;
}

.header {
  padding: 52px 40px 32px;
  text-align: center;
}

h1 {
  margin: 0 0 16px;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

p {
  margin: 0 0 16px;
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-muted);
}

.divider {
  width: 64px;
  height: 4px;
  margin: 28px auto;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--brand-primary), var(--brand-secondary));
}

.box {
  margin: 36px 0;
  padding: 32px;
  border-radius: 14px;
  text-align: center;
  border-left: 5px solid var(--brand-primary);
  background-color: rgba(59,130,246,0.08);
}

.otp {
  font-size: 38px;
  font-weight: 900;
  letter-spacing: 10px;
  color: var(--brand-secondary);
}

.note {
  font-size: 13px;
  margin-top: 12px;
}

.footer {
  padding: 26px;
  background-color: #f9fafb;
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
}

/* ------------------------ DARK MODE ------------------------ */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #0f172a !important;
    color: #e5e7eb !important;
  }

  .container {
    background-color: #020617 !important;
    box-shadow: none !important;
  }

  p {
    color: #cbd5f5 !important;
  }

  .footer {
    background-color: #020617 !important;
    color: #94a3b8 !important;
  }

  .box {
    background-color: rgba(59,130,246,0.15) !important;
  }
}

/* ------------------------ MOBILE ------------------------ */
@media (max-width: 600px) {
  .header {
    padding: 36px 22px;
  }

  h1 {
    font-size: 26px;
  }

  .otp {
    font-size: 32px;
    letter-spacing: 6px;
  }
}
</style>
</head>

<body>
<table width="100%" role="presentation">
<tr>
<td align="center" style="padding:40px 0;">
<table class="container" role="presentation">
${content}
<tr>
<td class="footer">
© ${new Date().getFullYear()} ${app_info.name}. All rights reserved.
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`;

/* -------------------------------------------------------------------------- */
/*                                 TEMPLATES                                  */
/* -------------------------------------------------------------------------- */

export const templates: Record<EmailType, any> = {
  [EMAIL_TYPES.VERIFY_OTP]: (data: any) => ({
    subject: "Verify Your Email Address",
    text: `Your verification code is ${data.otp}. It expires in 5 minutes.`,
    html: emailTheme(`
      <tr>
        <td class="header">
          <h1>Verify Your Email</h1>
          <div class="divider"></div>
          <p>Please use the secure code below to complete verification.</p>
          <div class="box">
            <div class="otp">${data.otp}</div>
            <div class="note">Expires in 5 minutes</div>
          </div>
          <p>If you didn’t request this, you can ignore this email.</p>
        </td>
      </tr>
    `),
  }),

  [EMAIL_TYPES.LOGIN_OTP]: (data: any) => ({
    subject: "Your Login Security Code",
    text: `Your login code is ${data.otp}. Valid for 5 minutes.`,
    html: emailTheme(`
      <tr>
        <td class="header">
          <h1>Login Verification</h1>
          <div class="divider"></div>
          <p>We detected a login attempt. Use the code below.</p>
          <div class="box">
            <div class="otp">${data.otp}</div>
            <div class="note">Valid for 5 minutes</div>
          </div>
          <p>Never share this code with anyone.</p>
        </td>
      </tr>
    `),
  }),

  [EMAIL_TYPES.WELCOME]: (data: any) => ({
    subject: `Welcome to ${app_info.name}!`,
    text: `Welcome ${data.name}! Your account is ready.`,
    html: emailTheme(`
      <tr>
        <td class="header">
          <h1>Welcome 🎉</h1>
          <div class="divider"></div>
          <p>Hello <strong>${data.name}</strong>,</p>
          <p>Your account is ready. We’re excited to have you.</p>
          <div class="box">
            <p>Jump into your dashboard and start exploring.</p>
          </div>
        </td>
      </tr>
    `),
  }),

  [EMAIL_TYPES.PASSWORD_RESET_OTP]: (data: any) => ({
    subject: "Password Reset Request",
    text: `Your password reset code is ${data.otp}.`,
    html: emailTheme(`
      <tr>
        <td class="header">
          <h1>Reset Your Password</h1>
          <div class="divider"></div>
          <p>Use the code below to reset your password.</p>
          <div class="box">
            <div class="otp">${data.otp}</div>
            <div class="note">Expires in 5 minutes</div>
          </div>
        </td>
      </tr>
    `),
  }),

  [EMAIL_TYPES.USER_APPROVAL]: (data: { email: string }) => ({
    subject: "Your Account Has Been Approved ✅",
    text: `Your account has been approved.`,
    html: emailTheme(`
      <tr>
        <td class="header">
          <h1>Account Approved</h1>
          <div class="divider"></div>
          <p>Hello <strong>${data.email}</strong>,</p>
          <div class="box">
            <p>Your account is now active. Welcome aboard!</p>
          </div>
        </td>
      </tr>
    `),
  }),

  [EMAIL_TYPES.USER_BAN]: (data: { email: string }) => ({
    subject: "Important: Account Suspended",
    text: `Your account has been suspended.`,
    html: emailTheme(`
      <tr>
        <td class="header">
          <h1>Account Suspended</h1>
          <div class="divider"></div>
          <p>Hello <strong>${data.email}</strong>,</p>
          <div class="box" style="border-left-color:#ef4444;">
            <p>Your account has been suspended. Please contact support.</p>
          </div>
        </td>
      </tr>
    `),
  }),

  [EMAIL_TYPES.HIGH_ERROR_RATE_ALERT]: (data: { errorRate: number; total: number; batchSize: number }) => ({
    subject: `🚨 CRITICAL: High API Error Rate Detected (${data.errorRate.toFixed(1)}%)`,
    text: `High error rate detected: ${data.errorRate.toFixed(1)}% errors in the last batch.`,
    html: emailTheme(`
      <tr>
        <td class="header">
          <h1 style="color: #ef4444;">High Error Rate Alert</h1>
          <div class="divider"></div>
          <p>The system detected a critical error rate in the last log batch.</p>
          
          <div class="box" style="border-left-color:#ef4444; background-color: rgba(239, 68, 68, 0.1);">
            <div class="otp" style="color: #ef4444; font-size: 32px;">${data.errorRate.toFixed(1)}%</div>
            <div class="note">Error Rate</div>
          </div>

          <table width="100%" style="margin-top: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Total Requests:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${data.total}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Batch Size:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${data.batchSize}</td>
            </tr>
          </table>

          <p style="margin-top: 24px;">Please check the monitoring dashboard immediately.</p>
        </td>
      </tr>
    `),
  }),

  [EMAIL_TYPES.LOGIN_ALERT]: (data: { device: string; time: string; location?: string }) => ({
    subject: "New Login Detected 🔐",
    text: `New login to your account from ${data.device} at ${data.time}.`,
    html: emailTheme(`
      <tr>
        <td class="header">
          <h1>New Login Detected</h1>
          <div class="divider"></div>
          <p>We noticed a new login to your account.</p>
          <div class="box">
            <p><strong>Device:</strong> ${data.device}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            ${data.location ? `<p><strong>Location:</strong> ${data.location}</p>` : ""}
          </div>
          <p>If this was you, you can ignore this email. If not, please change your password immediately.</p>
        </td>
      </tr>
    `),
  }),

  [EMAIL_TYPES.TWO_FACTOR_OTP]: (data: { otp: string }) => ({
    subject: "Login Verification Code 🛡️",
    text: `Your login verification code is ${data.otp}. Valid for 5 minutes.`,
    html: emailTheme(`
      <tr>
        <td class="header">
          <h1>Two-Factor Authentication</h1>
          <div class="divider"></div>
          <p>Please use the code below to complete your login.</p>
          <div class="box">
            <div class="otp">${data.otp}</div>
            <div class="note">Expires in 5 minutes</div>
          </div>
          <p>If you didn’t try to login, please secure your account.</p>
        </td>
      </tr>
    `),
  }),
};
