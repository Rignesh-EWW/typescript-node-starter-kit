import { z } from "zod";

export const UploadMediaSchema = z.object({
  model_type: z.string().min(1),
  model_id: z.string().regex(/^\d+$/),
  collection: z.string().min(1),
});

export const ListMediaQuerySchema = z.object({
  model_type: z.string().min(1),
  model_id: z.string().regex(/^\d+$/),
  collection: z.string().min(1).optional(),
});

export const MediaIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/),
});
