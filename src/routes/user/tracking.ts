import { Router } from "express";
import { requireAuth, requireUserAuth } from "@/middlewares/authMiddleware";
import validateRequest from "@/middlewares/validateRequest";
import { TrackingRequestSchema } from "@/requests/user/tracking.request";
import { trackingController } from "@controllers/user/tracking.controller";

const router = Router();

router.post(
  "/live-tracking",
  requireUserAuth,
  validateRequest({ body: TrackingRequestSchema }),
  trackingController.liveTracking
);

export default router;
