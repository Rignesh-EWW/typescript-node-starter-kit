import { Router } from "express";
import multer from "multer";
import {
  uploadSingle,
  uploadMultiple,
  listByModel,
  deleteMedia,
} from "@/controllers/media.controller";
import validateRequest from "@/middlewares/validateRequest";
import {
  UploadMediaSchema,
  ListMediaQuerySchema,
  MediaIdParamSchema,
} from "@/requests/media.request";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/upload",
  upload.single("file"),
  validateRequest({ body: UploadMediaSchema }),
  uploadSingle
);

router.post(
  "/upload-multiple",
  upload.array("files"),
  validateRequest({ body: UploadMediaSchema }),
  uploadMultiple
);

router.get(
  "/by-model",
  validateRequest({ query: ListMediaQuerySchema }),
  listByModel
);

router.delete(
  "/:id",
  validateRequest({ params: MediaIdParamSchema }),
  deleteMedia
);

export default router;
