import { Request, Response, NextFunction } from "express";
import { AdminLoginRequestSchema } from "@/requests/admin/auth.request";
import { findAdminByEmail } from "@/repositories/admin.repository";
import { hashPassword, comparePassword } from "@/utils/hash";
import { generateSession } from "@/utils/session";
import { AdminMessages } from "@/constants/messages";
import { AdminEntity } from "@/domain/entities/admin.entity";
import { formatAdminResponse } from "@/resources/admin/admin.resource";
import { logAdminLogin } from "@/jobs/admin.jobs";
import { AdminPassword } from "@/domain/valueObjects/adminPassword.vo";
import { asyncHandler } from "@/utils/asyncHandler";
import { appEmitter, APP_EVENTS } from "@/events/emitters/appEmitter";
import { issueAuthToken } from "@/utils/authToken";
import { signJwt, verifyJwt } from "@/utils/jwt";
import { success, error } from "@/utils/responseWrapper";
import { sendEmail } from "@/utils/mailer";
import { invalidateAuthToken } from "@/utils/authToken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const loginAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = AdminLoginRequestSchema.parse(req.body);

    const admin = await findAdminByEmail(email);
    if (!admin) return res.status(404).json(error(AdminMessages.notFound));

    const valid = await comparePassword(password, admin.password);
    if (!valid)
      return res.status(401).json(error(AdminMessages.invalidCredentials));

    const adminEntity = new AdminEntity(admin.id, admin.name, admin.email);

    await generateSession(req, admin.id, "admin");
    const token = issueAuthToken(admin.id, "admin");
    //     const token = signJwt({ id: admin.id, role: "admin" });
    logAdminLogin(admin.id, admin.email);

    appEmitter.emit(APP_EVENTS.ADMIN_LOGGED_IN, {
      id: admin.id,
      email: admin.email,
      timestamp: new Date(),
    });

    return res.json(
      success(AdminMessages.loginSuccess, {
        admin: formatAdminResponse(adminEntity),
        token,
      })
    );
  }
);

export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.user?.id!;

    // Invalidate the auth token to ensure it can't be used again
    invalidateAuthToken(adminId);

    res.send(success("Logged out successfully"));
  }
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const admin = await findAdminByEmail(email);
    if (!admin) return res.status(404).json(error(AdminMessages.notFound));

    const resetToken = signJwt({
      id: admin.id,
      email: admin.email,
      type: "admin-reset",
    });

    const baseUrl =
      process.env.ADMIN_RESET_PASSWORD_URL ||
      "http://localhost:5173/reset-password";
    const resetLink = `${baseUrl}?token=${resetToken}`;

    const emailHtml = `
      <p>Hello ${admin.name},</p>
      <p>You requested a password reset for your admin account.</p>
      <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail({
      to: admin.email,
      subject: "Admin Password Reset Request",
      html: emailHtml,
    });

    await prisma.passwordResetToken.create({
      data: {
        email: admin.email,
        token: resetToken,
        expires_at: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    return res.json(success("Password reset email sent successfully"));
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, password } = req.body;
    const decoded = verifyJwt(token) as { email: string };
    if (!decoded) return res.status(401).json(error(AdminMessages.notFound));

    const admin = await findAdminByEmail(decoded.email as string);
    if (!admin) return res.status(404).json(error(AdminMessages.notFound));

    const hashedPassword = await hashPassword(password);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    });

    return res.json(success("Password reset successfully"));
  }
);
