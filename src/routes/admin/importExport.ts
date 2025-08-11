import { Router } from "express";
import {
  exportUsersHandler,
  importUsersHandler,
} from "@/controllers/admin/importExport.controller";
import { requireAdminAuth } from "@/middlewares/authMiddleware";
import {
  ExportUserParamSchema,
  ImportUserBodySchema,
} from "@/requests/admin/export.request";
import validateRequest from "@/middlewares/validateRequest";
import { logRoute } from "@/decorators/logRoute";

const router = Router();

router.get(
  "/export/users/:type",
  logRoute("ADMIN_EXPORT_USERS"),
  requireAdminAuth,
  validateRequest({ params: ExportUserParamSchema }),
  exportUsersHandler
);

router.post(
  "/import/users",
  logRoute("ADMIN_IMPORT_USERS"),
  requireAdminAuth,
  validateRequest({ body: ImportUserBodySchema }),
  importUsersHandler
);

export default router;
