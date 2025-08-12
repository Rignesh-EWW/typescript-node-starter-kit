import nodemailer from "nodemailer";

export const sendEmail = async (
  email: string,
  subject: string,
  htmlTemplate: string
) => {
  console.log(process.env.SMTP_USER);
  console.log(process.env.SMTP_PASS);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Your App" <${process.env.SMTP_USER}>`,
    to: email,
    subject: subject,
    html: htmlTemplate,
  });
};
