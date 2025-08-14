import { Router } from "express";
import { requireAuth, requireUserAuth } from "@/middlewares/authMiddleware";
import validateRequest from "@/middlewares/validateRequest";
import { TrackingRequestSchema } from "@/requests/user/tracking.request";
import { invoiceController } from "@controllers/invoice.controller";

const router = Router();

router.post(
  "/download-invoice",
  requireAuth,
  invoiceController.downloadInvoice
);

export default router;
