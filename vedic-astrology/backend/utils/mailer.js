const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null; // email not configured - skip silently
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  return transporter;
};

exports.sendMail = async ({ subject, text, html }) => {
  const t = getTransporter();
  if (!t) return; // email not configured, skip
  await t.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.BUSINESS_EMAIL || process.env.SMTP_USER,
    subject,
    text,
    html
  });
};
