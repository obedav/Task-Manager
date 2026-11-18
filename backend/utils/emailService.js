'use strict';

/**
 * Email service using Resend.
 * Gracefully degrades if RESEND_API_KEY is not set (logs to console in dev).
 */

const { Resend } = require('resend');

const FROM = process.env.EMAIL_FROM || 'TaskFlow <noreply@taskflow.app>';
const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

const send = async ({ to, subject, html }) => {
  if (!resend) {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}\n${html.replace(/<[^>]+>/g, '')}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

const sendPasswordReset = async (user, resetToken) => {
  const link = `${BASE_URL}/reset-password?token=${resetToken}`;
  await send({
    to: user.email,
    subject: 'Reset your TaskFlow password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
        <h1 style="color:#1E40AF;margin-bottom:8px;">Reset your password</h1>
        <p>Hi ${user.name},</p>
        <p>We received a request to reset your password. Click the button below to set a new one. This link expires in 1 hour.</p>
        <a href="${link}" style="display:inline-block;margin:24px 0;padding:12px 24px;background:#1E40AF;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Reset Password
        </a>
        <p style="color:#64748B;font-size:13px;">If you didn't request a password reset, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0;" />
        <p style="color:#94A3B8;font-size:12px;">TaskFlow · Manage your work, your way</p>
      </div>
    `
  });
};

const sendWelcome = async (user) => {
  await send({
    to: user.email,
    subject: 'Welcome to TaskFlow!',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
        <h1 style="color:#1E40AF;">Welcome, ${user.name}!</h1>
        <p>Your TaskFlow account is ready. Start organizing your work with smart task management.</p>
        <a href="${BASE_URL}" style="display:inline-block;margin:24px 0;padding:12px 24px;background:#1E40AF;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Open TaskFlow
        </a>
        <p style="color:#64748B;font-size:13px;">Need help? Reply to this email anytime.</p>
      </div>
    `
  });
};

module.exports = { sendPasswordReset, sendWelcome };
