import { Router } from "express";
import {
  getNotifications,
  changeNotificationStatus,
  clearAllNotifications,
} from "@/controllers/user/notification.controller";
import { requireUserAuth } from "@/middlewares/authMiddleware";
import { logRoute } from "@/decorators/logRoute";
import validateRequest from "@/middlewares/validateRequest";
import { NotificationStatusParamSchema } from "@/requests/user/notification.request";

const router = Router();

router.get(
  "/notifications",
  logRoute("USER_NOTIFICATIONS"),
  requireUserAuth,
  getNotifications
);
router.get(
  "/notifications/status/change/:status",
  logRoute("NOTIF_STATUS_CHANGE"),
  requireUserAuth,
  validateRequest({ params: NotificationStatusParamSchema }),
  changeNotificationStatus
);

router.get(
  "/notifications/clear-all",
  logRoute("NOTIF_CLEAR_ALL"),
  requireUserAuth,
  clearAllNotifications
);

export default router;
