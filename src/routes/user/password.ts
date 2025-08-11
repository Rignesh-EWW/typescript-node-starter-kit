import { Router } from "express";
import {
  changePassword,
  resetPassword,
} from "@/controllers/user/password.controller";
import { requireUserAuth } from "@/middlewares/authMiddleware";
import validateRequest from "@/middlewares/validateRequest";
import {
  ChangePasswordRequestSchema,
  ResetPasswordBodySchema,
  ResetPasswordParamsSchema,
} from "@/requests/user/password.request";
import { logRoute } from "@/decorators/logRoute";

const router = Router();

router.post(
  "/change/password",
  logRoute("CHANGE_PASSWORD"),
  requireUserAuth,
  validateRequest({ body: ChangePasswordRequestSchema }),
  changePassword
);

router.post(
  "/reset-password/:token",
  validateRequest({
    params: ResetPasswordParamsSchema,
    body: ResetPasswordBodySchema,
  }),
  resetPassword
);

export default router;
