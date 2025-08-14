import { Request, Response, NextFunction } from "express";
import { StatusCode } from "@/constants/statusCodes";
import { error } from "@/utils/responseWrapper";
import { hasRole, can, DEFAULT_MODEL_TYPE } from "@/services/rbac.service";

const getUser = (req: Request) => (req as any).user as { id?: number; modelType?: string } | undefined;

export const requireRole = (rolePipeOrArray: string | string[], guard = "web") => {
  const roles = Array.isArray(rolePipeOrArray)
    ? rolePipeOrArray
    : rolePipeOrArray.split("|").map((r) => r.trim());
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = getUser(req);
    if (!user?.id) {
      return res.status(StatusCode.UNAUTHORIZED).json(error("Unauthorized"));
    }
    const modelType = user.modelType || DEFAULT_MODEL_TYPE;
    for (const role of roles) {
      if (await hasRole(modelType, user.id, role, guard)) {
        return next();
      }
    }
    return res.status(StatusCode.FORBIDDEN).json(error("Forbidden"));
  };
};

export const requirePermission = (
  permPipeOrArray: string | string[],
  guard = "web"
) => {
  const perms = Array.isArray(permPipeOrArray)
    ? permPipeOrArray
    : permPipeOrArray.split("|").map((p) => p.trim());
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = getUser(req);
    if (!user?.id) {
      return res.status(StatusCode.UNAUTHORIZED).json(error("Unauthorized"));
    }
    const modelType = user.modelType || DEFAULT_MODEL_TYPE;
    for (const perm of perms) {
      if (await can(modelType, user.id, perm, guard)) {
        return next();
      }
    }
    return res.status(StatusCode.FORBIDDEN).json(error("Forbidden"));
  };
};

export const roleOrPermission = (pipeString: string, guard = "web") => {
  const items = pipeString.split("|").map((i) => i.trim());
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = getUser(req);
    if (!user?.id) {
      return res.status(StatusCode.UNAUTHORIZED).json(error("Unauthorized"));
    }
    const modelType = user.modelType || DEFAULT_MODEL_TYPE;
    for (const item of items) {
      if (await hasRole(modelType, user.id, item, guard)) return next();
      if (await can(modelType, user.id, item, guard)) return next();
    }
    return res.status(StatusCode.FORBIDDEN).json(error("Forbidden"));
  };
};
