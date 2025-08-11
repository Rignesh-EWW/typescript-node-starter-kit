import {
  Gender,
  DeviceType,
} from "./../../../node_modules/.prisma/client/index.d";
// import { Gender } from "@prisma/client";
import { z } from "zod";

export const CreateUserBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  dob: z.string(),
  gender: z.nativeEnum(Gender),
  profile_image: z.string(),
  password: z.string().min(8),
  device_type: z.nativeEnum(DeviceType),
  device_token: z.string(),
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
