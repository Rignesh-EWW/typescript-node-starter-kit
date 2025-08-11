import { z } from "zod";

export const ExportUserParamSchema = z.object({
  type: z.enum(["csv", "xlsx"]),
});

export const ImportUserBodySchema = z.object({
  file: z.instanceof(File),
  type: z.enum(["csv", "xlsx"]),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  dob: z.string(),
  gender: z.string(),
  password: z.string().min(8),
});
