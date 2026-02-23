import type { NotificationEmailJobData } from "src/bull/processors/email/notificationEmailProcessor.js";
import type { PaymentSuccessJobData } from "src/bull/processors/email/paymentSuccessProcessor.js";
import { env } from "src/configs/env.js";
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
  /* Brand (unchanged as requested) */
  --brand-primary: ${brandPrimary};
  --brand-secondary: ${brandSecondary};

  /* Backgrounds (modern cool tone) */
  --bg-light: #f8fafc;          /* subtle blue tint */
  --bg-card: #ffffff;

  /* Text hierarchy */
  --text-main: #0f172a;         /* deeper slate */
  --text-muted: #64748b;        /* refined muted */
  
  /* Borders */
  --border-soft: #e2e8f0;       /* modern soft gray */

  /* Accent background */
  --accent-bg: #f1f5f9;         /* hover / subtle section bg */

  /* Optional advanced additions (SaaS polish) */
  --shadow-soft: 0 1px 2px rgba(15, 23, 42, 0.06);
  --shadow-medium: 0 4px 12px rgba(15, 23, 42, 0.08);

  --radius-md: 12px;
  --radius-lg: 16px;

  --transition-fast: 150ms ease;
  --transition-smooth: 250ms cubic-bezier(0.4, 0, 0.2, 1);
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
  border-radius: 8px;
  border: 1px solid var(--border-soft);
  overflow: hidden;
}

.header {
  padding: 48px 40px 28px;
  text-align: center;
}

h1 {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.3px;
  color: var(--text-main);
}

p {
  margin: 0 0 16px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-muted);
}

.divider {
  width: 48px;
  height: 2px;
  margin: 24px auto;
  border-radius: 2px;
  background: var(--border-soft);
}

.box {
  margin: 32px 40px;
  padding: 24px;
  border-radius: 6px;
  text-align: center;
  border: 1px solid var(--border-soft);
  background-color: var(--accent-bg);
}

.otp {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 8px;
  color: var(--text-main);
  font-variant-numeric: tabular-nums;
}

.note {
  font-size: 13px;
  margin-top: 12px;
  color: var(--text-muted);
}

.footer {
  padding: 24px;
  background-color: var(--accent-bg);
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
  border-top: 1px solid var(--border-soft);
}

/* ------------------------ DARK MODE ------------------------ */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-light: #0a0a0a !important;
    --bg-card: #171717 !important;
    --text-main: #fafafa !important;
    --text-muted: #a3a3a3 !important;
    --border-soft: #262626 !important;
    --accent-bg: #1c1c1c !important;
  }

  body {
    background-color: var(--bg-light) !important;
    color: var(--text-main) !important;
  }

  .container {
    background-color: var(--bg-card) !important;
    border-color: var(--border-soft) !important;
  }

  p {
    color: var(--text-muted) !important;
  }

  .footer {
    background-color: var(--accent-bg) !important;
    color: var(--text-muted) !important;
  }

  .box {
    background-color: var(--accent-bg) !important;
    border-color: var(--border-soft) !important;
  }
}

/* ------------------------ MOBILE ------------------------ */
@media (max-width: 600px) {
  .header {
    padding: 36px 24px 24px;
  }

  h1 {
    font-size: 22px;
  }

  .box {
    margin: 24px 20px;
    padding: 20px;
  }

  .otp {
    font-size: 28px;
    letter-spacing: 6px;
  }
}
</style>
</head>

<body>
<table width="100%" role="presentation">
<tr>
<td align="center" style="padding:40px 16px;">
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
  [EMAIL_TYPES.VIDEO_READY]: (data: { instructorName: string; videoTitle: string; courseName: string; videoLink: string }) => ({
    subject: "Video Processing Complete 🎬",
    text: `Your video "${data.videoTitle}" in course "${data.courseName}" is now ready.`,
    html: emailTheme(`
      <tr>
        <td class="header">
          <h1>Video Ready for Action! 🚀</h1>
          <div class="divider"></div>
          <p>Hello <strong>${data.instructorName}</strong>,</p>
          <p>Great news! Your video has successfully finished processing and is now live for your students.</p>
          
          <div class="box">
            <h2 style="margin: 0 0 10px; font-size: 18px; color: #1f2937;">${data.videoTitle}</h2>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">${data.courseName}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${data.videoLink}" style="display: inline-block; padding: 14px 32px; background-color: ${app_info.primaryColor}; color: ${app_info.secondaryColor}; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);">
              View Video Content
            </a>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px;">Students enrolled in this course can now access this content immediately.</p>
        </td>
      </tr>
    `),
  }),
  [EMAIL_TYPES.PAYMENT_SUCCESS]: (data: PaymentSuccessJobData) => ({

    subject: `You're enrolled in ${data.courseTitle}`,
    text: `Your payment for course "${data.courseTitle}" has been successful. Order ID: ${data.orderId}`,
    html: emailTheme(`
      <tr>
        <td class="header" style="padding: 48px 40px 0; text-align: left;">

          <!-- Checkmark icon -->
          <div style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #dcfce7;
            margin-bottom: 24px;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#16a34a" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 style="
            margin: 0 0 8px;
            font-size: 22px;
            font-weight: 600;
            letter-spacing: -0.4px;
            color: var(--text-main);
            text-align: left;
          ">Enrollment confirmed</h1>

          <p style="
            margin: 0 0 32px;
            font-size: 15px;
            color: var(--text-muted);
            text-align: left;
          ">Hi <strong style="color: var(--text-main); font-weight: 500;">${data.userName}</strong> — your payment went through and you now have full access.</p>

          <!-- Details table -->
          <table width="100%" role="presentation" style="
            border: 1px solid var(--border-soft);
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 28px;
          ">
            <tr>
              <td style="
                padding: 14px 20px;
                border-bottom: 1px solid var(--border-soft);
                background-color: var(--accent-bg);
              ">
                <table width="100%" role="presentation">
                  <tr>
                    <td style="font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-muted);">Course</td>
                    <td style="font-size: 14px; font-weight: 600; color: var(--text-main); text-align: right;">${data.courseTitle}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="
                padding: 14px 20px;
                border-bottom: 1px solid var(--border-soft);
              ">
                <table width="100%" role="presentation">
                  <tr>
                    <td style="font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-muted);">Amount paid</td>
                    <td style="font-size: 14px; font-weight: 600; color: var(--text-main); text-align: right;">${data.currency} ${data.amount}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 20px;">
                <table width="100%" role="presentation">
                  <tr>
                    <td style="font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-muted);">Order ID</td>
                    <td style="font-size: 13px; font-weight: 500; color: var(--text-muted); text-align: right; font-family: 'Menlo', 'Courier New', monospace;">${data.orderId}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- CTA button -->
          <table role="presentation" style="margin-bottom: 40px;">
            <tr>
              <td>
                <a href="${env.CLIENT_URL}/classroom" style="
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: var(--text-main);
                  color: var(--bg-card);
                  text-decoration: none;
                  border-radius: 6px;
                  font-size: 14px;
                  font-weight: 500;
                  letter-spacing: -0.01em;
                ">Open Classroom →</a>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    `),
  }),
  [EMAIL_TYPES.NOTIFICATION_EMAIL]: (data: NotificationEmailJobData) => ({
    subject: data.subject,
    text: `${data.context.title}\n\n${data.context.message}${data.context.link ? `\n\n${data.context.link}` : ""}`,
    html: emailTheme(`
      <tr>
        <td class="header" style="padding: 48px 40px 40px; text-align: left;">

          <!-- Bell icon -->
          <div style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background-color: var(--accent-bg);
            border: 1px solid var(--border-soft);
            margin-bottom: 24px;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#64748b" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>

          <!-- Title -->
          <h1 style="
            margin: 0 0 8px;
            font-size: 20px;
            font-weight: 600;
            letter-spacing: -0.3px;
            color: var(--text-main);
            text-align: left;
          ">${data.context.title}</h1>

          <!-- Greeting -->
          <p style="
            margin: 0 0 24px;
            font-size: 14px;
            color: var(--text-muted);
            text-align: left;
          ">Hi <strong style="color: var(--text-main); font-weight: 500;">${data.context.name}</strong>,</p>

          <!-- Divider -->
          <div style="
            width: 100%;
            height: 1px;
            background-color: var(--border-soft);
            margin-bottom: 24px;
          "></div>

          <!-- Message block -->
          <table width="100%" role="presentation" style="
            border: 1px solid var(--border-soft);
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 28px;
          ">
            <tr>
              <td style="
                padding: 20px 24px;
                background-color: var(--accent-bg);
                font-size: 14px;
                line-height: 1.7;
                color: var(--text-muted);
                border-left: 3px solid var(--border-soft);
              ">
                ${data.context.message}
              </td>
            </tr>
          </table>

          <!-- CTA (conditional) -->
          ${data.context.link ? `
          <table role="presentation" style="margin-bottom: 8px;">
            <tr>
              <td>
                <a href="${data.context.link}" style="
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: var(--text-main);
                  color: var(--bg-card);
                  text-decoration: none;
                  border-radius: 6px;
                  font-size: 14px;
                  font-weight: 500;
                  letter-spacing: -0.01em;
                ">View details →</a>
              </td>
            </tr>
          </table>

          <p style="margin: 12px 0 0; font-size: 12px; color: var(--text-muted);">
            Or copy this link:
            <span style="
              font-family: 'Menlo', 'Courier New', monospace;
              font-size: 11px;
              color: var(--text-muted);
            ">${data.context.link}</span>
          </p>
          ` : ""}

        </td>
      </tr>
    `),
  }),
};


