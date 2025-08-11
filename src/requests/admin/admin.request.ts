import { z } from "zod";

export const CreateAdminUserRequestSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8).max(20),
});

export const UpdateAdminUserBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8).max(20).optional(),
});

export const UpdateAdminUserParamSchema = z.object({
  id: z.string().regex(/^\d+$/),
});

export const DeleteAdminUserParamSchema = z.object({
  id: z.string().regex(/^\d+$/),
});

export const ChangeAdminPasswordBodySchema = z.object({
  oldPassword: z.string().min(8).max(20),
  newPassword: z.string().min(8).max(20),
});

export const UpdateAdminProfileBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
});
