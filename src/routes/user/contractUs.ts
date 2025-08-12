import { contactUsController } from "@/controllers/user/contactUs.controller";
import { Router } from "express";
import { requireAuth, requireUserAuth } from "@/middlewares/authMiddleware";
import validateRequest from "@/middlewares/validateRequest";
import { ContactUsRequestSchema } from "@/requests/user/contactUs.request";

const router = Router();

router.post(
  "/contact-us",
  requireUserAuth,
  validateRequest({ body: ContactUsRequestSchema }),
  contactUsController.contactUs
);

export default router;
