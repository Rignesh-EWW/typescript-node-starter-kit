import { Request, Response, NextFunction } from "express";
import { getAllUsers } from "@/repositories/user.repository";
import {
  updateUserById,
  toggleUserStatus,
  softDeleteUser,
  createUser,
  upload,
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
} from "@/requests/admin/user.request";
import {
  logUserUpdated,
  logUserToggled,
  logUserDeleted,
} from "@/jobs/user.jobs";
import { success, error } from "@/utils/responseWrapper";

export const getAllUsersHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await getAllUsers();
    return res.json(success("Users fetched", formatUserListForAdmin(users)));
  }
);

export const createUserHandler = asyncHandler(
  async (req: Request, res: Response) => {
    // Handle file upload first
    upload.single("profile_image")(req, res, async (err) => {
      if (err) {
        return res.status(400).json(error(err.message));
      }

      try {
        const body = CreateUserBodySchema.parse(req.body);
        const user = await createUser(body, req.file);
        return res.json(success("User created", formatUserForAdmin(user)));
      } catch (error: any) {
        return res.status(400).json(error(error.message));
      }
    });
  }
);

export const updateUserHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Handle file upload first
    upload.single("profile_image")(req, res, async (err) => {
      if (err) {
        return res.status(400).json(error(err.message));
      }

      try {
        const { id } = UpdateUserParamSchema.parse(req.params);
        const body = UpdateUserBodySchema.parse(req.body);

        const updated = await updateUserById(Number(id), body, req.file);

        logUserUpdated(Number(id));

        return res.json(
          success("User updated successfully", formatUserForAdmin(updated))
        );
      } catch (error: any) {
        return res.status(400).json(error(error.message));
      }
    });
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
