import { z } from "zod";
import { DeviceType, Gender } from "@prisma/client";

export const CreateUserBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "Phone is required"),
  dob: z.string().optional(),
  gender: z.nativeEnum(Gender),
  profile_image: z.string().optional(), // Can be base64 string or uploaded via file
  password: z.string().min(8, "Password must be at least 8 characters"),
  device_type: z.nativeEnum(DeviceType).optional().default("android"),
  device_token: z.string().optional().default(""),
});

export const UpdateUserParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "User ID must be a number"),
});

export const UpdateUserBodySchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().min(1, "Phone is required").optional(),
  dob: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  profile_image: z.string().optional(), // Can be base64 string or uploaded via file
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  device_type: z.nativeEnum(DeviceType).optional(),
  device_token: z.string().optional(),
});

export const GetUserParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "User ID must be a number"),
});

export const GetUserQuerySchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().optional(),
  dob: z.string().optional(),
  profile_image: z.string().optional(),
});

export const ToggleUserParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "User ID must be a number"),
});

export const DeleteUserParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "User ID must be a number"),
});
