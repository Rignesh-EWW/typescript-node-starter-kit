import { Request, Response, NextFunction } from "express";
import { getAllUsers } from "@/repositories/user.repository";
import {
  updateUserById,
  toggleUserStatus,
  softDeleteUser,
  createUser,
  getUserById,
} from "@/services/UserModule.service";
import {
  formatUserListForAdmin,
  formatUserForAdmin,
} from "@/resources/admin/user.resource";
import { asyncHandler } from "@/utils/asyncHandler";
import {
  UpdateUserParamSchema,
  UpdateUserBodySchema,
  DeleteUserParamSchema,
  ToggleUserParamSchema,
  CreateUserBodySchema,
  GetUserParamSchema,
} from "@/requests/admin/user.request";
import {
  logUserUpdated,
  logUserToggled,
  logUserDeleted,
} from "@/jobs/user.jobs";
import { success, error } from "@/utils/responseWrapper";

export const getAllUsersHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const users = await getAllUsers(offset, limit, req.query.search as string);
    const total_count = await getAllUsers(
      0,
      Number.MAX_SAFE_INTEGER,
      req.query.search as string
    ).then((u) => u.length);
    const per_page = limit;
    const current_page = page;
    return res.json(
      success("Users fetched", {
        users: formatUserListForAdmin(users),
        total_count,
        per_page,
        current_page,
      })
    );
  }
);

export const getUserByIdHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = GetUserParamSchema.parse(req.params);
    const user = await getUserById(Number(id));
    return res.json(success("User fetched", formatUserForAdmin(user)));
  }
);

export const createUserHandler = asyncHandler(
  async (req: Request, res: Response) => {
    // Handle file upload first

    try {
      const body = CreateUserBodySchema.parse(req.body);
      const user = await createUser(body);
      return res.json(success("User created", formatUserForAdmin(user)));
    } catch (err: any) {
      return res.status(400).json(error((err as Error).message));
    }
  }
);

export const updateUserHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Handle file upload first

    try {
      const { id } = UpdateUserParamSchema.parse(req.params);
      const body = UpdateUserBodySchema.parse(req.body);

      const updated = await updateUserById(Number(id), body, req.file);

      logUserUpdated(Number(id));

      return res.json(
        success("User updated successfully", formatUserForAdmin(updated))
      );
    } catch (err: any) {
      return res.status(400).json(error((err as Error).message));
    }
  }
);

export const toggleUserStatusHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = ToggleUserParamSchema.parse(req.params);
    const user = await toggleUserStatus(Number(id));

    logUserToggled(user.id, user.status);

    return res.json(
      success(
        `User ${user.status ? "activated" : "deactivated"}`,
        formatUserForAdmin(user)
      )
    );
  }
);

export const deleteUserHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = DeleteUserParamSchema.parse(req.params);
    const user = await softDeleteUser(Number(id));

    logUserDeleted(user.id);

    return res.json(
      success("User deleted successfully", formatUserForAdmin(user))
    );
  }
);
