import { z } from "zod";

export const CreateFaqBodySchema = z.object({
  question: z.record(z.string(), z.string()),
  answer: z.record(z.string(), z.string()),
});

// Common schema for params id
export const FaqIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "FAQ ID must be a number"),
});

export const UpdateFaqBodySchema = z.object({
  question: z.record(z.string(), z.string()).optional(),
  answer: z.record(z.string(), z.string()).optional(),
});
