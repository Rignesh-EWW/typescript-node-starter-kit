import { Request, Response, NextFunction } from "express";
import { findAdminById } from "@/repositories/admin.repository";
import { updateAdminProfile as updateAdminProfileRepository } from "@/repositories/admin.repository";
import { formatAdminResponse } from "@/resources/admin/admin.resource";
import { AdminMessages } from "@/constants/messages";
import { asyncHandler } from "@/utils/asyncHandler";
import { success, error } from "@/utils/responseWrapper";
import {
  ChangeAdminPasswordBodySchema,
  UpdateAdminProfileBodySchema,
} from "@/requests/admin/admin.request";
import bcrypt from "bcrypt";
import { updateAdminPassword } from "@/repositories/admin.repository";
import { PrismaClient } from "@prisma/client";

export const getAdminProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.user?.id!;
    const admin = await findAdminById(adminId);

    if (!admin) {
      return res.status(404).json(error(AdminMessages.notFound));
    }

    return res.json(success("Admin fetched", formatAdminResponse(admin)));
  }
);

export const changeAdminPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.user?.id!;
    const { oldPassword, newPassword } = ChangeAdminPasswordBodySchema.parse(
      req.body
    );
    const prisma = new PrismaClient();
    const adminRecord = await prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (
      !adminRecord ||
      !(await bcrypt.compare(oldPassword, adminRecord.password))
    ) {
      return res.status(400).json(error("Old password is incorrect"));
    }
    await updateAdminPassword(adminId, newPassword);
    return res.send(success("Password changed successfully"));
  }
);

export const updateAdminProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.user?.id!;
    const { name, email } = UpdateAdminProfileBodySchema.parse(req.body);
    await updateAdminProfileRepository(adminId, { name, email });
    return res.send(success("Profile updated successfully"));
  }
);
