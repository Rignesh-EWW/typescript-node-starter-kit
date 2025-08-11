import { Router } from "express";
import {
  forgotPassword,
  loginAdmin,
  logout,
} from "@/controllers/admin/auth.controller";
import { AdminLoginRequestSchema } from "@/requests/admin/auth.request";
import validateRequest from "@/middlewares/validateRequest";
import { logRoute } from "@/decorators/logRoute";
import { requireAdminAuth } from "@/middlewares/authMiddleware";

const router = Router();

router.post(
  "/login",
  logRoute("ADMIN_LOGIN"),
  validateRequest({ body: AdminLoginRequestSchema }),
  loginAdmin
);

router.post(
  "/forgot-password",
  logRoute("ADMIN_FORGOT_PASSWORD"),
  forgotPassword
);

router.get("/logout", logRoute("ADMIN_LOGOUT"), requireAdminAuth, logout);

export default router;
