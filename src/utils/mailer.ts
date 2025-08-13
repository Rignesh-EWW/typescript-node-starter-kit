import { mailTransport } from "@/config/mail.config";
import fs from "fs";
import path from "path";
const config = require("../../config");

export const loadTemplate = (
  templateName: string,
  variables: Record<string, string>
) => {
  const templatePath = path.join(
    __dirname,
    `../templates/mail/${templateName}.html`
  );
  let template = fs.readFileSync(templatePath, "utf-8");

  for (const key in variables) {
    template = template.replace(new RegExp(`{{${key}}}`, "g"), variables[key]);
  }

  return template;
};
export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  return mailTransport.sendMail({
    from: config.mail.from,
    to,
    subject,
    html,
  });
};
