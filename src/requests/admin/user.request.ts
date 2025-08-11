import { z } from "zod";
import { Gender } from "@prisma/client";

export const CreateUserBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  dob: z.string(),
  gender: z.nativeEnum(Gender),
  profile_image: z.string(),
  password: z.string().min(8),
});

export const UpdateUserParamSchema = z.object({
  id: z.string().regex(/^\d+$/),
});

export const UpdateUserBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  dob: z.string(),
  gender: z.nativeEnum(Gender),
  profile_image: z.string(),
});

export const ToggleUserParamSchema = z.object({
  id: z.string().regex(/^\d+$/),
});

export const DeleteUserParamSchema = z.object({
  id: z.string().regex(/^\d+$/),
});
