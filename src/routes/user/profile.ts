import { Router } from "express";
import {
  getProfile,
  updateLanguage,
  updateNotification,
  updateProfile,
  uploadProfilePicture,
} from "@/controllers/user/profile.controller";
import { requireUserAuth } from "@/middlewares/authMiddleware";
import { logRoute } from "@/decorators/logRoute";
import validateRequest from "@/middlewares/validateRequest";
import {
  UpdateLanguageRequestSchema,
  UpdateNotificationRequestSchema,
  UpdateProfileRequestSchema,
} from "@/requests/user/profile.request";

const router = Router();

router.get("/me", logRoute("USER_ME"), requireUserAuth, getProfile);
router.post(
  "/update",
  logRoute("USER_UPDATE"),
  requireUserAuth,
  validateRequest({ body: UpdateProfileRequestSchema }),
  updateProfile
);
router.post(
  "/uploadProfilePicture",
  logRoute("USER_UPDATE"),
  requireUserAuth,
  uploadProfilePicture
);
router.post(
  "/update/language",
  logRoute("USER_UPDATE_LANGUAGE"),
  requireUserAuth,
  validateRequest({ body: UpdateLanguageRequestSchema }),
  updateLanguage
);

router.post(
  "/update/notification",
  logRoute("USER_UPDATE_NOTIFICATION"),
  requireUserAuth,
  validateRequest({ body: UpdateNotificationRequestSchema }),
  updateNotification
);

export default router;
