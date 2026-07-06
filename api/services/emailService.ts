import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp-relay.brevo.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@foodiemarket.com";
const FROM_NAME = process.env.FROM_NAME || "Foodie Market";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const subject = "Reset your Foodie Market password";
  const html = `
    <p>Hi there,</p>
    <p>You requested a password reset for your Foodie Market account.</p>
    <p><a href="${resetLink}">Click here to reset your password</a></p>
    <p>This link expires in 1 hour. If you did not request this, you can safely ignore this email.</p>
    <p>— The Foodie Market Team</p>
  `;

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject,
    html,
    text: `Reset your password: ${resetLink}`,
  });
}

export function isEmailConfigured(): boolean {
  return Boolean(SMTP_USER && SMTP_PASS);
}
