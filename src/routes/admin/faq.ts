import { Router } from "express";
import {
  getFaqListHandler,
  createFaqHandler,
  updateFaqHandler,
  deleteFaqHandler,
  toggleFaqStatusHandler,
  getFaqHandler,
} from "@/controllers/admin/faq.controller";
import { requireAdminAuth } from "@/middlewares/authMiddleware";
import { logRoute } from "@/decorators/logRoute";
import validateRequest from "@/middlewares/validateRequest";

const router = Router();

router.get(
  "/",
  logRoute("ADMIN_FAQ_LIST"),
  requireAdminAuth,
  getFaqListHandler
);

router.get("/:id", logRoute("ADMIN_FAQ_GET"), requireAdminAuth, getFaqHandler);

router.post(
  "/",
  logRoute("ADMIN_FAQ_CREATE"),
  requireAdminAuth,
  createFaqHandler
);
router.put(
  "/:id",
  logRoute("ADMIN_FAQ_UPDATE"),
  requireAdminAuth,
  updateFaqHandler
);

router.get(
  "/:id/toggle",
  logRoute("ADMIN_FAQ_TOGGLE"),
  requireAdminAuth,
  toggleFaqStatusHandler
);

router.delete(
  "/:id",
  logRoute("ADMIN_FAQ_DELETE"),
  requireAdminAuth,
  deleteFaqHandler
);

export default router;
