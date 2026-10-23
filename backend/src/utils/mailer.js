const nodemailer = require('nodemailer');

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS || EMAIL_PASS === 'your_gmail_app_password') return null;
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST || 'smtp.gmail.com',
    port: Number(EMAIL_PORT) || 587,
    secure: Number(EMAIL_PORT) === 465,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  return transporter;
}

/** Returns true if the mail was really sent, false if only logged to console. */
async function sendOtpMail(to, otp, purpose) {
  const t = getTransporter();
  const title = purpose === 'register' ? 'Verify your email' : 'Your login code';
  console.log(`📧 [OTP:${purpose}] ${to} → ${otp}`);
  if (!t) return false;
  await t.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: `${otp} is your Nisha Boutique verification code`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:28px;border:1px solid #ede9fe;border-radius:16px">
      <h2 style="color:#5b21b6;margin:0 0 6px">Nisha Boutique</h2>
      <p style="color:#4c4480">${title}</p>
      <div style="font-size:34px;letter-spacing:10px;font-weight:700;color:#7c3aed;background:#f5f3ff;padding:16px;text-align:center;border-radius:12px">${otp}</div>
      <p style="color:#7c7aa8;font-size:13px;margin-top:18px">This code expires in 10 minutes. If you didn't request it, ignore this email.</p>
    </div>`,
  });
  return true;
}
module.exports = { sendOtpMail };
