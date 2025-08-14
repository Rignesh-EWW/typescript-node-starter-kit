import { Router } from "express";
import {
  createRoleHandler,
  getRoleHandler,
  createPermissionHandler,
  getPermissionHandler,
  givePermissionToRoleHandler,
  revokePermissionFromRoleHandler,
  assignRoleHandler,
  removeRoleHandler,
  hasRoleHandler,
  hasPermissionHandler,
} from "@/controllers/rbac.controller";

const router = Router();

router.post("/roles", createRoleHandler);
router.get("/roles/:name", getRoleHandler);
router.post("/permissions", createPermissionHandler);
router.get("/permissions/:name", getPermissionHandler);
router.post("/roles/:role/permissions", givePermissionToRoleHandler);
router.delete("/roles/:role/permissions/:permission", revokePermissionFromRoleHandler);
router.post("/users/:userId/roles", assignRoleHandler);
router.delete("/users/:userId/roles/:role", removeRoleHandler);
router.get("/users/:userId/roles/:role", hasRoleHandler);
router.get("/users/:userId/permissions/:permission", hasPermissionHandler);

export default router;
