import { Router } from "express";
import validateRequest from "@/middlewares/validateRequest";
import { authenticationController } from "@/controllers/user/auth.controller";
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  SocialLoginRequestSchema,
  OTPRequestSchema,
  verifyOTPRequestSchema,
  verifyLoginOTPRequestSchema,
  ResetPasswordSchema,
} from "@/requests/user/auth.request";
import { AppleDetailsRequestSchema } from "@/requests/user/auth.request";
import { logAppleRoute } from "@/middlewares/logRouteMiddleware";
import { SendOtpRequestSchema } from "@/requests/user/auth.request";
import { ForgotPasswordSchema } from "@/requests/user/auth.request";
import { requireAuth, requireUserAuth } from "@/middlewares/authMiddleware";

const router = Router();

router.post(
  "/auth/register",
  requireAuth,
  validateRequest({ body: RegisterRequestSchema }),
  authenticationController.registerUser
);
router.post(
  "/auth/login",
  requireAuth,
  validateRequest({ body: LoginRequestSchema }),
  authenticationController.loginUser
);
router.post(
  "/auth/loginWithOTP",
  requireAuth,
  validateRequest({ body: OTPRequestSchema }),
  authenticationController.loginWithOTP
);

router.post(
  "/auth/verifyOTPLogin",
  requireAuth,
  validateRequest({ body: verifyLoginOTPRequestSchema }),
  authenticationController.verifyOTPLogin
);

router.post(
  "/auth/sendOTP",
  requireUserAuth,
  validateRequest({ body: OTPRequestSchema }),
  authenticationController.sendOTP
);

router.post(
  "/auth/verifyOTP",
  requireUserAuth,
  validateRequest({ body: verifyOTPRequestSchema }),
  authenticationController.verifyOTP
);

router.post(
  "/auth/social-login",
  validateRequest({ body: SocialLoginRequestSchema }),
  authenticationController.socialLogin
);
router.get(
  "/auth/apple-details/:id",
  logAppleRoute,
  validateRequest({ params: AppleDetailsRequestSchema }),
  authenticationController.appleDetails
);
router.post(
  "/auth/forgot/password",
  requireAuth,
  validateRequest({ body: ForgotPasswordSchema }),
  authenticationController.forgotPassword
);

router.post(
  "/auth/resetPassword",
  requireAuth,
  validateRequest({ body: ResetPasswordSchema }),
  authenticationController.resetPassword
);
export default router;
