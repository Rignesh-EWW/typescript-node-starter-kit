import { Router } from "express";
import { initApp } from "@/controllers/user/init.controller";
import validateRequest from "@/middlewares/validateRequest";
import { InitAppRequestSchema } from "@/requests/user/init.request";
import { requireAuth } from "@/middlewares/authMiddleware";

const router = Router();

router.get(
  "/init/:app_version/:app_type",
  requireAuth,
  validateRequest({ params: InitAppRequestSchema }),
  initApp
);

export default router;
