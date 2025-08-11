import nodemailer from "nodemailer";

export const sendResetEmail = async (email: string, token: string) => {
  console.log(process.env.SMTP_USER);
  console.log(process.env.SMTP_PASS);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const resetUrl = `https://yourapp.com/reset-password?token=${token}`;

  const htmlTemplate = `
    <h2>Password Reset</h2>
    <p>Click the link below to reset your password. This link will expire in 15 minutes.</p>
    <a href="${resetUrl}">${resetUrl}</a>
  `;

  await transporter.sendMail({
    from: `"Your App" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset your password",
    html: htmlTemplate,
  });
};
