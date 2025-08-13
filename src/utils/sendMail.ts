import nodemailer from "nodemailer";
const config = require("../../config");

export const sendEmail = async (
  email: string,
  subject: string,
  htmlTemplate: string
) => {
  console.log(config.smtp.user);
  console.log(config.smtp.pass);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  await transporter.sendMail({
    from: `"Your App" <${config.smtp.user}>`,
    to: email,
    subject: subject,
    html: htmlTemplate,
  });
};
