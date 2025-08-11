import { Router } from "express";
import {
  getAllUsersHandler,
  updateUserHandler,
  toggleUserStatusHandler,
  deleteUserHandler,
  createUserHandler,
} from "@/controllers/admin/user.controller";
import { requireAdminAuth } from "@/middlewares/authMiddleware";
import { logRoute } from "@/decorators/logRoute";
import {
  UpdateUserParamSchema,
  UpdateUserBodySchema,
  CreateUserBodySchema,
} from "@/requests/admin/user.request";
import validateRequest from "@/middlewares/validateRequest";
import {
  ToggleUserParamSchema,
  DeleteUserParamSchema,
} from "@/requests/admin/user.request";

const router = Router();

router.get(
  "/users",
  logRoute("ADMIN_USER_LIST"),
  requireAdminAuth,
  getAllUsersHandler
);
router.post(
  "/users/create",
  logRoute("ADMIN_USER_CREATE"),
  requireAdminAuth,
  validateRequest({ body: CreateUserBodySchema }),
  createUserHandler
);
router.post(
  "/users/:id/update",
  logRoute("ADMIN_USER_UPDATE"),
  requireAdminAuth,
  validateRequest({
    params: UpdateUserParamSchema,
    body: UpdateUserBodySchema,
  }),
  updateUserHandler
);
router.get(
  "/users/:id/toggle",
  logRoute("ADMIN_USER_TOGGLE"),
  requireAdminAuth,
  validateRequest({ params: ToggleUserParamSchema }),
  toggleUserStatusHandler
);

router.get(
  "/users/:id/delete",
  logRoute("ADMIN_USER_DELETE"),
  requireAdminAuth,
  validateRequest({ params: DeleteUserParamSchema }),
  deleteUserHandler
);

export default router;
