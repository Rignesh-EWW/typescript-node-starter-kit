import { Request, Response } from "express";
import {
  findOrCreateRole,
  findRoleByName,
  findOrCreatePermission,
  findPermissionByName,
  givePermissionToRole,
  revokePermissionFromRole,
  assignRole,
  removeRole,
  hasRole,
  hasPermission,
  DEFAULT_MODEL_TYPE,
} from "@/services/rbac.service";
import { asyncHandler } from "@/utils/asyncHandler";
import { success } from "@/utils/responseWrapper";

export const createRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  const { name, guard = "web", roleableId, roleableType } = req.body;
  const role = await findOrCreateRole(name, guard, { roleableId, roleableType });
  return res.json(success("role created", role));
});

export const getRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.params;
  const { guard = "web", roleableId, roleableType } = req.query as any;
  const role = await findRoleByName(name, guard as string, {
    roleableId: roleableId ? Number(roleableId) : undefined,
    roleableType: roleableType as string | undefined,
  });
  return res.json(success("role", role));
});

export const createPermissionHandler = asyncHandler(async (req: Request, res: Response) => {
  const { name, guard = "web" } = req.body;
  const perm = await findOrCreatePermission(name, guard);
  return res.json(success("permission created", perm));
});

export const getPermissionHandler = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.params;
  const { guard = "web" } = req.query as any;
  const perm = await findPermissionByName(name, guard as string);
  return res.json(success("permission", perm));
});

export const givePermissionToRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.params;
  const { permission, guard = "web", roleableId, roleableType } = req.body;
  await givePermissionToRole(role, permission, guard, { roleableId, roleableType });
  return res.json(success("permission attached to role"));
});

export const revokePermissionFromRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  const { role, permission } = req.params;
  const { guard = "web", roleableId, roleableType } = req.body;
  await revokePermissionFromRole(role, permission, guard, { roleableId, roleableType });
  return res.json(success("permission revoked from role"));
});

export const assignRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role, guard = "web", roleableId, roleableType } = req.body;
  await assignRole(
    DEFAULT_MODEL_TYPE,
    BigInt(userId),
    role,
    guard,
    { roleableId, roleableType }
  );
  return res.json(success("role assigned"));
});

export const removeRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  const { userId, role } = req.params;
  const { guard = "web", roleableId, roleableType } = req.body;
  await removeRole(
    DEFAULT_MODEL_TYPE,
    BigInt(userId),
    role,
    guard,
    { roleableId, roleableType }
  );
  return res.json(success("role removed"));
});

export const hasRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  const { userId, role } = req.params;
  const { guard = "web", roleableId, roleableType } = req.query as any;
  const result = await hasRole(
    DEFAULT_MODEL_TYPE,
    BigInt(userId),
    role,
    guard as string,
    { roleableId: roleableId ? Number(roleableId) : undefined, roleableType: roleableType as string | undefined }
  );
  return res.json(success("has role", { hasRole: result }));
});

export const hasPermissionHandler = asyncHandler(async (req: Request, res: Response) => {
  const { userId, permission } = req.params;
  const { guard = "web" } = req.query as any;
  const result = await hasPermission(
    DEFAULT_MODEL_TYPE,
    BigInt(userId),
    permission,
    guard as string
  );
  return res.json(success("has permission", { hasPermission: result }));
});

