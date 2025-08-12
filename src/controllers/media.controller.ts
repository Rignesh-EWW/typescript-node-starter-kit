import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createStorage } from '@/config/storage.config';
import { mediaCollections } from '@/config/media-collections';
import { MediaService, UploadedFile } from '@/services/media.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { success } from '@/utils/responseWrapper';

const prisma = new PrismaClient();
const mediaService = new MediaService(prisma, createStorage(), mediaCollections);

export const uploadSingle = asyncHandler(async (req: Request, res: Response) => {
  const { modelType, modelId, collection } = req.params as any;
  const file = (req as any).file as UploadedFile | undefined;
  if (!file) {
    return res.status(400).json({ error: 'file is required' });
  }
  const media = await mediaService.attachFile({
    file,
    modelType,
    modelId: Number(modelId),
    collection,
  });
  res.json(success('uploaded', { id: Number(media.id), url: mediaService.urlFor(media) }));
});

export const uploadMultiple = asyncHandler(async (req: Request, res: Response) => {
  const { modelType, modelId, collection } = req.params as any;
  const files = (req as any).files as UploadedFile[];
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'files are required' });
  }
  const results: Array<{ id: number; url: string }> = [];
  for (const file of files) {
    const media = await mediaService.attachFile({
      file,
      modelType,
      modelId: Number(modelId),
      collection,
    });
    results.push({ id: Number(media.id), url: mediaService.urlFor(media) });
  }
  res.json(success('uploaded', results));
});

export const listByModel = asyncHandler(async (req: Request, res: Response) => {
  const { modelType, modelId } = req.params as any;
  const list = await mediaService.listByModel(modelType, Number(modelId));
  const result = list.map((m) => ({ id: Number(m.id), url: mediaService.urlFor(m) }));
  res.json(success('ok', result));
});

export const deleteMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as any;
  await mediaService.delete(Number(id));
  res.json(success('deleted'));
});

export const updateCustomProps = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as any;
  const { custom } = req.body as any;
  await mediaService.updateCustomProps(Number(id), custom ?? {});
  res.json(success('updated'));
});
