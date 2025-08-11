import { Router } from "express";
import {
  changeAdminPassword,
  getAdminProfile,
  updateAdminProfile,
} from "@/controllers/admin/profile.controller";
import { requireAdminAuth } from "@/middlewares/authMiddleware";
import { logRoute } from "@/decorators/logRoute";
import validateRequest from "@/middlewares/validateRequest";
import {
  ChangeAdminPasswordBodySchema,
  UpdateAdminProfileBodySchema,
} from "@/requests/admin/admin.request";

const router = Router();

router.get("/", logRoute("ADMIN_ME"), requireAdminAuth, getAdminProfile);
router.post(
  "/change-password",
  logRoute("ADMIN_CHANGE_PASSWORD"),
  requireAdminAuth,
  validateRequest({ body: ChangeAdminPasswordBodySchema }),
  changeAdminPassword
);
router.post(
  "/update-profile",
  logRoute("ADMIN_UPDATE_PROFILE"),
  requireAdminAuth,
  validateRequest({ body: UpdateAdminProfileBodySchema }),
  updateAdminProfile
);

export default router;
