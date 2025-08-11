import { Request, Response } from "express";
import { error, success } from "@/utils/responseWrapper";
import {
  getAllAdmins,
  createAdmin,
  updateAdminUser as updateAdminUserRepository,
  deleteAdminUser as deleteAdminUserRepository,
} from "@/repositories/admin.repository";
import {
  CreateAdminUserRequestSchema,
  UpdateAdminUserBodySchema,
  DeleteAdminUserParamSchema,
} from "@/requests/admin/admin.request";

export const getAdminUserList = async (req: Request, res: Response) => {
  const adminUsers = await getAllAdmins(req.user?.id!);
  res.send(success("Admin user list fetched successfully", adminUsers));
};

export const createAdminUser = async (req: Request, res: Response) => {
  const { name, email, password } = CreateAdminUserRequestSchema.parse(
    req.body
  );
  const admin = await createAdmin(name, email, password);

  if (!admin) {
    return res.status(400).json(error("Failed to create admin user", null));
  }
  res.send(success("Admin user created successfully", admin));
};

export const updateAdminUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password } = UpdateAdminUserBodySchema.parse(req.body);
  const admin = await updateAdminUserRepository(Number(id), {
    name,
    email,
    password: password || "",
  });
  res.send(success("Admin user updated successfully", admin));
};

export const deleteAdminUser = async (req: Request, res: Response) => {
  const { id } = DeleteAdminUserParamSchema.parse(req.params);
  const admin = await deleteAdminUserRepository(Number(id));
  res.send(success("Admin user deleted successfully", admin));
};
