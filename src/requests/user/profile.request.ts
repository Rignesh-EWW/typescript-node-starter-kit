import { Gender, Language } from "@prisma/client";
import { z } from "zod";

export const UpdateProfileRequestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(9),
  dob: z.coerce.date(),
  gender: z.nativeEnum(Gender),
  profile_image: z.string().min(6),
});

export const UpdateLanguageRequestSchema = z.object({
  language: z.nativeEnum(Language),
});

export const UpdateNotificationRequestSchema = z.object({
  notifications_enabled: z.boolean(),
});
