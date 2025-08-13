import { Request, Response } from 'express';
import { mediaService, UploadedFile } from '@/services/media.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { success } from '@/utils/responseWrapper';

export const uploadSingle = asyncHandler(async (req: Request, res: Response) => {
  const { model_type, model_id, collection } = req.body as any;
  const file = (req as any).file as UploadedFile | undefined;
  if (!file) {
    return res.status(400).json({ error: 'file is required' });
  }
  const media = await mediaService.attachFile({
    file,
    modelType: model_type,
    modelId: Number(model_id),
    collection,
  });
  res.json(success('uploaded', { id: Number(media.id), url: mediaService.urlFor(media) }));
});

export const uploadMultiple = asyncHandler(async (req: Request, res: Response) => {
  const { model_type, model_id, collection } = req.body as any;
  const files = (req as any).files as UploadedFile[];
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'files are required' });
  }
  const results: Array<{ id: number; url: string }> = [];
  for (const file of files) {
    const media = await mediaService.attachFile({
      file,
      modelType: model_type,
      modelId: Number(model_id),
      collection,
    });
    results.push({ id: Number(media.id), url: mediaService.urlFor(media) });
  }
  res.json(success('uploaded', results));
});

export const listByModel = asyncHandler(async (req: Request, res: Response) => {
  const { model_type, model_id, collection } = req.query as any;
  const list = await mediaService.listByModel(model_type, Number(model_id));
  const filtered = collection ? list.filter((m) => m.collection_name === collection) : list;
  const result = filtered.map((m) => ({ id: Number(m.id), url: mediaService.urlFor(m) }));
  res.json(success('ok', result));
});

export const deleteMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as any;
  await mediaService.delete(Number(id));
  res.json(success('deleted'));
});
