import { z } from "zod";

export const ContactUsRequestSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(3, "Name must be at least 3 characters long"),

  subject: z
    .string({ required_error: "Subject is required" })
    .min(3, "Subject must be at least 3 characters long"),

  message: z
    .string({ required_error: "Message is required" })
    .min(10, "Message must be at least 10 characters long"),
});
