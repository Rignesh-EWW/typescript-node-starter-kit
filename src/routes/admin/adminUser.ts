import { Router } from "express";
import { requireAdminAuth } from "@/middlewares/authMiddleware";
import { logRoute } from "@/decorators/logRoute";
import {
  createAdminUser,
  getAdminUserList,
  updateAdminUser,
  deleteAdminUser,
} from "@/controllers/admin/adminUser.controller";
import validateRequest from "@/middlewares/validateRequest";
import {
  CreateAdminUserRequestSchema,
  UpdateAdminUserBodySchema,
  UpdateAdminUserParamSchema,
  DeleteAdminUserParamSchema,
} from "@/requests/admin/admin.request";

const router = Router();

router.get(
  "/",
  logRoute("ADMIN_USER_LIST"),
  requireAdminAuth,
  getAdminUserList
);

router.post(
  "/",
  logRoute("ADMIN_USER_CREATE"),
  requireAdminAuth,
  validateRequest({ body: CreateAdminUserRequestSchema }),
  createAdminUser
);

router.put(
  "/:id",
  logRoute("ADMIN_USER_UPDATE"),
  requireAdminAuth,
  validateRequest({
    params: UpdateAdminUserParamSchema,
    body: UpdateAdminUserBodySchema,
  }),
  updateAdminUser
);

router.delete(
  "/:id",
  logRoute("ADMIN_USER_DELETE"),
  requireAdminAuth,
  validateRequest({ params: DeleteAdminUserParamSchema }),
  deleteAdminUser
);

export default router;
