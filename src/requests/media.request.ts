import { z } from 'zod';

export const MediaParamsSchema = z.object({
  modelType: z.string().min(1),
  modelId: z.string().regex(/^\d+$/),
  collection: z.string().min(1),
});

export const MediaModelParamsSchema = z.object({
  modelType: z.string().min(1),
  modelId: z.string().regex(/^\d+$/),
});

export const MediaIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/),
});

export const UpdateCustomPropsSchema = z.object({
  custom: z.record(z.any()),
});
