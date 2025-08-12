import { Request, Response, NextFunction } from "express";
import { success, error } from "@/utils/responseWrapper";
import { asyncHandler } from "@/utils/asyncHandler";
import { ContactUsMessages } from "@/constants/contactUs";
import { createContactUs } from "@/services/contactUs.service";
import { sendEmail } from "@/utils/sendMail";
import { loadTemplate } from "@/utils/mailer";

export const contactUs = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, subject, message } = req.body;
    const email = "ewwmayur@gmail.com";

    console.log(name, subject, message, email);
    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.json(
        error(req.translator.t(ContactUsMessages.allFieldsRequired))
      );
    }

    // Email content
    const htmlContent = loadTemplate("contact-us", {
      name,
      email,
      subject,
      message,
    });

    await createContactUs({
      full_name: name,
      email,
      subject,
      message,
    });

    await sendEmail(email, subject, htmlContent);
    return res.json(
      success(req.translator.t(ContactUsMessages.emailSentSuccessfully))
    );
  }
);

export const contactUsController = {
  contactUs,
};
