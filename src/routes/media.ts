import { Router } from 'express';
import multer from 'multer';
import {
  uploadSingle,
  uploadMultiple,
  listByModel,
  deleteMedia,
  updateCustomProps,
} from '@/controllers/media.controller';
import validateRequest from '@/middlewares/validateRequest';
import {
  MediaParamsSchema,
  MediaModelParamsSchema,
  MediaIdParamSchema,
  UpdateCustomPropsSchema,
} from '@/requests/media.request';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/:modelType/:modelId/:collection',
  validateRequest({ params: MediaParamsSchema }),
  upload.single('file'),
  uploadSingle
);

router.post(
  '/:modelType/:modelId/:collection/batch',
  validateRequest({ params: MediaParamsSchema }),
  upload.array('files'),
  uploadMultiple
);

router.get(
  '/:modelType/:modelId',
  validateRequest({ params: MediaModelParamsSchema }),
  listByModel
);

router.delete(
  '/:id',
  validateRequest({ params: MediaIdParamSchema }),
  deleteMedia
);

router.patch(
  '/:id/custom',
  validateRequest({ params: MediaIdParamSchema, body: UpdateCustomPropsSchema }),
  updateCustomProps
);

export default router;
