import { Router } from 'express';
import multer from 'multer';
import { uploadSingle, uploadMultiple, listByModel, deleteMedia } from '@/controllers/media.controller';
import validateRequest from '@/middlewares/validateRequest';
import { UploadMediaSchema, ListMediaQuerySchema, MediaIdParamSchema } from '@/requests/media.request';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', validateRequest({ body: UploadMediaSchema }), upload.single('file'), uploadSingle);

router.post(
  '/upload-multiple',
  validateRequest({ body: UploadMediaSchema }),
  upload.array('files'),
  uploadMultiple
);

router.get('/by-model', validateRequest({ query: ListMediaQuerySchema }), listByModel);

router.delete('/:id', validateRequest({ params: MediaIdParamSchema }), deleteMedia);

export default router;
