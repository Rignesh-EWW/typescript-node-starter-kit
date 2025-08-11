import { z } from "zod";
import { PrismaClient, DeviceType, Gender } from "@prisma/client";

export const RegisterRequestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(9),
  password: z.string().min(6),
  device_type: z.nativeEnum(DeviceType),
  device_token: z.string().min(6),
  dob: z.coerce.date(),
  gender: z.nativeEnum(Gender),
  profile_image: z.string().min(6),
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  device_type: z.nativeEnum(DeviceType),
  device_token: z.string().min(6),
});

export const OTPRequestSchema = z.object({
  phone: z.string().min(6),
});

export const verifyLoginOTPRequestSchema = z.object({
  phone: z.string().min(6),
  otp: z.string().min(6),
  device_type: z.nativeEnum(DeviceType),
  device_token: z.string().min(6),
});

export const verifyOTPRequestSchema = z.object({
  phone: z.string().min(6),
  otp: z.string().min(6),
});

export const SocialLoginRequestSchema = z.object({
  social_id: z.string().min(3),
  provider: z.enum(["google", "facebook", "apple"]),
  name: z.string().min(2),
  email: z.string().email().optional(),
});

export const AppleDetailsRequestSchema = z.object({
  id: z.string().min(3),
});

export const SendOtpRequestSchema = z.object({
  email: z.string().email(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8),
});
