import { PrismaClient } from "@prisma/client";
import fs from "fs";

export const prisma = new PrismaClient();

export const DEFAULT_MODEL_TYPE = "App\\Models\\User";

export type TenantScope = {
  roleableId?: number | bigint | null;
  roleableType?: string | null;
};

let superAdminRoleName: string | undefined;
let cacheEnabled = false;
let cacheTTL = 60;
const cache = new Map<string, { value: boolean; expires: number }>();
let tenantContextProvider: (() => TenantScope) | undefined;

const resolveScope = (scope?: TenantScope): TenantScope => {
  if (scope) return scope;
  if (tenantContextProvider) return tenantContextProvider() || {};
  return {};
};

const buildRoleWhere = (
  name: string,
  guard: string,
  scope: TenantScope
) => {
  const where: any = { name, guardName: guard };
  if (scope.roleableId !== undefined) where.roleableId = BigInt(scope.roleableId);
  if (scope.roleableType !== undefined) where.roleableType = scope.roleableType;
  return where;
};

const cacheKey = (
  modelType: string,
  modelId: bigint,
  permission: string,
  guard: string,
  scope: TenantScope
) =>
  `${modelType}|${modelId}|${permission}|${guard}|${scope.roleableId ?? ""}:${scope.roleableType ?? ""}`;

const getCached = (key: string): boolean | undefined => {
  if (!cacheEnabled) return undefined;
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
};

const setCached = (key: string, value: boolean) => {
  if (!cacheEnabled) return;
  cache.set(key, { value, expires: Date.now() + cacheTTL * 1000 });
};

export const enableRbacCache = (ttlSeconds: number) => {
  cacheEnabled = true;
  cacheTTL = ttlSeconds;
};

export const disableRbacCache = () => {
  cacheEnabled = false;
  flushRbacCache();
};

export const flushRbacCache = () => {
  cache.clear();
};

export const setTenantContextProvider = (fn: () => TenantScope) => {
  tenantContextProvider = fn;
};

export const withTenantScope = async <T>(
  scope: TenantScope,
  fn: () => Promise<T> | T
): Promise<T> => {
  const prev = tenantContextProvider;
  tenantContextProvider = () => scope;
  try {
    return await fn();
  } finally {
    tenantContextProvider = prev;
  }
};

// A) Role & Permission Catalog
export const findRoleByName = async (
  name: string,
  guard = "web",
  scope?: TenantScope
) => {
  const s = resolveScope(scope);
  return prisma.role.findFirst({ where: buildRoleWhere(name, guard, s) });
};

export const findOrCreateRole = async (
  name: string,
  guard = "web",
  scope?: TenantScope
) => {
  const existing = await findRoleByName(name, guard, scope);
  if (existing) return existing;
  const s = resolveScope(scope);
  return prisma.role.create({
    data: {
      name,
      guardName: guard,
      roleableId: s.roleableId ? BigInt(s.roleableId) : null,
      roleableType: s.roleableType ?? null,
    },
  });
};

export const findPermissionByName = async (
  name: string,
  guard = "web"
) => {
  return prisma.permission.findFirst({
    where: { name, guardName: guard },
  });
};

export const findOrCreatePermission = async (
  name: string,
  guard = "web"
) => {
  const existing = await findPermissionByName(name, guard);
  if (existing) return existing;
  return prisma.permission.create({
    data: { name, guardName: guard },
  });
};

// B) Role ⇄ Permission Linking
export const givePermissionToRole = async (
  roleName: string,
  permissionName: string,
  guard = "web",
  scope?: TenantScope
) => {
  const role = await findOrCreateRole(roleName, guard, scope);
  const perm = await findOrCreatePermission(permissionName, guard);
  await prisma.roleHasPermission.upsert({
    where: {
      permissionId_roleId: { permissionId: perm.id, roleId: role.id },
    },
    update: {},
    create: { permissionId: perm.id, roleId: role.id },
  });
  flushRbacCache();
};

export const revokePermissionFromRole = async (
  roleName: string,
  permissionName: string,
  guard = "web",
  scope?: TenantScope
) => {
  const role = await findRoleByName(roleName, guard, scope);
  const perm = await findPermissionByName(permissionName, guard);
  if (!role || !perm) return;
  await prisma.roleHasPermission.deleteMany({
    where: { permissionId: perm.id, roleId: role.id },
  });
  flushRbacCache();
};

export const syncPermissionsForRole = async (
  roleName: string,
  permissionNames: string[],
  guard = "web",
  scope?: TenantScope
) => {
  const role = await findOrCreateRole(roleName, guard, scope);
  const perms = await prisma.permission.findMany({
    where: { name: { in: permissionNames }, guardName: guard },
  });
  const permIds = perms.map((p) => p.id);
  await prisma.$transaction([
    prisma.roleHasPermission.deleteMany({
      where: {
        roleId: role.id,
        permissionId: { notIn: permIds },
      },
    }),
    ...permIds.map((id) =>
      prisma.roleHasPermission.upsert({
        where: { permissionId_roleId: { permissionId: id, roleId: role.id } },
        update: {},
        create: { permissionId: id, roleId: role.id },
      })
    ),
  ]);
  flushRbacCache();
};

// C) Model Assignments
export const assignRole = async (
  modelType: string,
  modelId: number | bigint,
  roleName: string,
  guard = "web",
  scope?: TenantScope
) => {
  const role = await findOrCreateRole(roleName, guard, scope);
  await prisma.modelHasRole.upsert({
    where: {
      roleId_modelId_modelType: {
        roleId: role.id,
        modelId: BigInt(modelId),
        modelType,
      },
    },
    update: {},
    create: {
      roleId: role.id,
      modelId: BigInt(modelId),
      modelType,
    },
  });
  flushRbacCache();
};

export const removeRole = async (
  modelType: string,
  modelId: number | bigint,
  roleName: string,
  guard = "web",
  scope?: TenantScope
) => {
  const role = await findRoleByName(roleName, guard, scope);
  if (!role) return;
  await prisma.modelHasRole.deleteMany({
    where: {
      roleId: role.id,
      modelId: BigInt(modelId),
      modelType,
    },
  });
  flushRbacCache();
};

export const syncRoles = async (
  modelType: string,
  modelId: number | bigint,
  roleNames: string[],
  guard = "web",
  scope?: TenantScope
) => {
  const roles = await prisma.role.findMany({
    where: { name: { in: roleNames }, guardName: guard },
  });
  const roleIds = roles.map((r) => r.id);
  await prisma.$transaction([
    prisma.modelHasRole.deleteMany({
      where: {
        modelId: BigInt(modelId),
        modelType,
        NOT: { roleId: { in: roleIds } },
      },
    }),
    ...roleIds.map((roleId) =>
      prisma.modelHasRole.upsert({
        where: {
          roleId_modelId_modelType: {
            roleId,
            modelId: BigInt(modelId),
            modelType,
          },
        },
        update: {},
        create: {
          roleId,
          modelId: BigInt(modelId),
          modelType,
        },
      })
    ),
  ]);
  flushRbacCache();
};

export const givePermissionToModel = async (
  modelType: string,
  modelId: number | bigint,
  permissionName: string,
  guard = "web"
) => {
  const perm = await findOrCreatePermission(permissionName, guard);
  await prisma.modelHasPermission.upsert({
    where: {
      permissionId_modelId_modelType: {
        permissionId: perm.id,
        modelId: BigInt(modelId),
        modelType,
      },
    },
    update: {},
    create: {
      permissionId: perm.id,
      modelId: BigInt(modelId),
      modelType,
    },
  });
  flushRbacCache();
};

export const revokePermissionFromModel = async (
  modelType: string,
  modelId: number | bigint,
  permissionName: string,
  guard = "web"
) => {
  const perm = await findPermissionByName(permissionName, guard);
  if (!perm) return;
  await prisma.modelHasPermission.deleteMany({
    where: {
      permissionId: perm.id,
      modelId: BigInt(modelId),
      modelType,
    },
  });
  flushRbacCache();
};

export const syncPermissionsForModel = async (
  modelType: string,
  modelId: number | bigint,
  permissionNames: string[],
  guard = "web"
) => {
  const perms = await prisma.permission.findMany({
    where: { name: { in: permissionNames }, guardName: guard },
  });
  const permIds = perms.map((p) => p.id);
  await prisma.$transaction([
    prisma.modelHasPermission.deleteMany({
      where: {
        modelId: BigInt(modelId),
        modelType,
        NOT: { permissionId: { in: permIds } },
      },
    }),
    ...permIds.map((permissionId) =>
      prisma.modelHasPermission.upsert({
        where: {
          permissionId_modelId_modelType: {
            permissionId,
            modelId: BigInt(modelId),
            modelType,
          },
        },
        update: {},
        create: {
          permissionId,
          modelId: BigInt(modelId),
          modelType,
        },
      })
    ),
  ]);
  flushRbacCache();
};

// D) Checks
export const hasRole = async (
  modelType: string,
  modelId: number | bigint,
  roleName: string,
  guard = "web",
  scope?: TenantScope
): Promise<boolean> => {
  const role = await findRoleByName(roleName, guard, scope);
  if (!role) return false;
  const existing = await prisma.modelHasRole.findUnique({
    where: {
      roleId_modelId_modelType: {
        roleId: role.id,
        modelId: BigInt(modelId),
        modelType,
      },
    },
  });
  return !!existing;
};

export const hasAnyRole = async (
  modelType: string,
  modelId: number | bigint,
  roleNames: string[],
  guard = "web",
  scope?: TenantScope
) => {
  for (const name of roleNames) {
    if (await hasRole(modelType, modelId, name, guard, scope)) return true;
  }
  return false;
};

export const hasAllRoles = async (
  modelType: string,
  modelId: number | bigint,
  roleNames: string[],
  guard = "web",
  scope?: TenantScope
) => {
  for (const name of roleNames) {
    if (!(await hasRole(modelType, modelId, name, guard, scope))) return false;
  }
  return true;
};

export const hasPermission = async (
  modelType: string,
  modelId: number | bigint,
  permissionName: string,
  guard = "web"
): Promise<boolean> => {
  const perm = await findPermissionByName(permissionName, guard);
  if (!perm) return false;
  const existing = await prisma.modelHasPermission.findUnique({
    where: {
      permissionId_modelId_modelType: {
        permissionId: perm.id,
        modelId: BigInt(modelId),
        modelType,
      },
    },
  });
  return !!existing;
};

export const hasAnyPermission = async (
  modelType: string,
  modelId: number | bigint,
  permissionNames: string[],
  guard = "web"
) => {
  for (const p of permissionNames) {
    if (await hasPermission(modelType, modelId, p, guard)) return true;
  }
  return false;
};

export const hasAllPermissions = async (
  modelType: string,
  modelId: number | bigint,
  permissionNames: string[],
  guard = "web"
) => {
  for (const p of permissionNames) {
    if (!(await hasPermission(modelType, modelId, p, guard))) return false;
  }
  return true;
};

export const can = async (
  modelType: string,
  modelId: number | bigint,
  permissionName: string,
  guard = "web",
  scope?: TenantScope
): Promise<boolean> => {
  const s = resolveScope(scope);
  const key = cacheKey(
    modelType,
    BigInt(modelId),
    permissionName,
    guard,
    s
  );
  const cached = getCached(key);
  if (cached !== undefined) return cached;

  if (await hasPermission(modelType, modelId, permissionName, guard)) {
    setCached(key, true);
    return true;
  }

  const roleLinks = await prisma.modelHasRole.findMany({
    where: { modelId: BigInt(modelId), modelType },
    select: { roleId: true },
  });
  if (roleLinks.length === 0) {
    setCached(key, false);
    return false;
  }
  const perm = await findPermissionByName(permissionName, guard);
  if (!perm) {
    setCached(key, false);
    return false;
  }
  const count = await prisma.roleHasPermission.count({
    where: {
      roleId: { in: roleLinks.map((r) => r.roleId) },
      permissionId: perm.id,
    },
  });
  const result = count > 0;
  setCached(key, result);
  return result;
};

// E) Super Admin
export const setSuperAdminRoleName = (roleName: string) => {
  superAdminRoleName = roleName;
};

export const isSuperAdmin = async (
  modelType: string,
  modelId: number | bigint,
  guard = "web",
  scope?: TenantScope
): Promise<boolean> => {
  if (!superAdminRoleName) return false;
  return hasRole(modelType, modelId, superAdminRoleName, guard, scope);
};

export const authorize = async (
  modelType: string,
  modelId: number | bigint,
  ability: string,
  guard = "web",
  scope?: TenantScope
): Promise<boolean> => {
  if (await isSuperAdmin(modelType, modelId, guard, scope)) return true;
  return can(modelType, modelId, ability, guard, scope);
};

// F) Sync Utilities
export const syncRbacState = async (
  input: any,
  options: any = {}
) => {
  const {
    pruneExtraRoles,
    pruneExtraPermissions,
    pruneExtraRolePermissions,
    pruneExtraModelRoles,
    pruneExtraModelPermissions,
    dryRun,
  } = options;

  const exec = async (cb: () => Promise<void>) => {
    if (!dryRun) await cb();
  };

  const roleMap = new Map<string, any>();
  for (const r of input.roles || []) {
    const role = await findOrCreateRole(r.name, r.guard || "web", {
      roleableId: r.roleableId ?? null,
      roleableType: r.roleableType ?? null,
    });
    roleMap.set(`${role.name}|${role.guardName}`, role);
  }

  const permMap = new Map<string, any>();
  for (const p of input.permissions || []) {
    const perm = await findOrCreatePermission(p.name, p.guard || "web");
    permMap.set(`${perm.name}|${perm.guardName}`, perm);
  }

  for (const rp of input.rolePermissions || []) {
    await exec(() =>
      givePermissionToRole(
        rp.roleName,
        rp.permissionName,
        rp.guard || "web",
        { roleableId: rp.roleableId ?? null, roleableType: rp.roleableType ?? null }
      )
    );
  }

  for (const mr of input.modelRoles || []) {
    await exec(() =>
      assignRole(
        mr.modelType,
        mr.modelId,
        mr.roleName,
        mr.guard || "web",
        { roleableId: mr.roleableId ?? null, roleableType: mr.roleableType ?? null }
      )
    );
  }

  for (const mp of input.modelPermissions || []) {
    await exec(() =>
      givePermissionToModel(
        mp.modelType,
        mp.modelId,
        mp.permissionName,
        mp.guard || "web"
      )
    );
  }

  if (pruneExtraRoles) {
    const names = (input.roles || []).map((r: any) => r.name);
    await exec(() =>
      prisma.role.deleteMany({
        where: { name: { notIn: names } },
      })
    );
  }

  if (pruneExtraPermissions) {
    const names = (input.permissions || []).map((p: any) => p.name);
    await exec(() =>
      prisma.permission.deleteMany({
        where: { name: { notIn: names } },
      })
    );
  }

  if (pruneExtraRolePermissions) {
    const combos = new Set(
      (input.rolePermissions || []).map(
        (rp: any) => `${rp.roleName}|${rp.permissionName}|${rp.guard || "web"}`
      )
    );
    const all = await prisma.roleHasPermission.findMany({
      include: { role: true, permission: true },
    });
    await exec(async () => {
      for (const item of all) {
        const key = `${item.role.name}|${item.permission.name}|${item.role.guardName}`;
        if (!combos.has(key)) {
          await prisma.roleHasPermission.delete({
            where: {
              permissionId_roleId: {
                permissionId: item.permissionId,
                roleId: item.roleId,
              },
            },
          });
        }
      }
    });
  }

  if (pruneExtraModelRoles) {
    const combos = new Set(
      (input.modelRoles || []).map(
        (mr: any) => `${mr.modelType}|${mr.modelId}|${mr.roleName}`
      )
    );
    const all = await prisma.modelHasRole.findMany({ include: { role: true } });
    await exec(async () => {
      for (const item of all) {
        const key = `${item.modelType}|${item.modelId}|${item.role.name}`;
        if (!combos.has(key)) {
          await prisma.modelHasRole.delete({
            where: {
              roleId_modelId_modelType: {
                roleId: item.roleId,
                modelId: item.modelId,
                modelType: item.modelType,
              },
            },
          });
        }
      }
    });
  }

  if (pruneExtraModelPermissions) {
    const combos = new Set(
      (input.modelPermissions || []).map(
        (mp: any) => `${mp.modelType}|${mp.modelId}|${mp.permissionName}`
      )
    );
    const all = await prisma.modelHasPermission.findMany({
      include: { permission: true },
    });
    await exec(async () => {
      for (const item of all) {
        const key = `${item.modelType}|${item.modelId}|${item.permission.name}`;
        if (!combos.has(key)) {
          await prisma.modelHasPermission.delete({
            where: {
              permissionId_modelId_modelType: {
                permissionId: item.permissionId,
                modelId: item.modelId,
                modelType: item.modelType,
              },
            },
          });
        }
      }
    });
  }

  if (!dryRun) flushRbacCache();
};

export const exportRbacState = async (filters: any = {}) => {
  const roles = await prisma.role.findMany();
  const permissions = await prisma.permission.findMany();
  const rolePermissions = await prisma.roleHasPermission.findMany({
    include: { role: true, permission: true },
  });
  const modelRoles = await prisma.modelHasRole.findMany({ include: { role: true } });
  const modelPermissions = await prisma.modelHasPermission.findMany({
    include: { permission: true },
  });
  return {
    roles: roles.map((r) => ({
      name: r.name,
      guard: r.guardName,
      roleableId: r.roleableId,
      roleableType: r.roleableType,
    })),
    permissions: permissions.map((p) => ({ name: p.name, guard: p.guardName })),
    rolePermissions: rolePermissions.map((rp) => ({
      roleName: rp.role.name,
      permissionName: rp.permission.name,
      guard: rp.role.guardName,
      roleableId: rp.role.roleableId,
      roleableType: rp.role.roleableType,
    })),
    modelRoles: modelRoles.map((mr) => ({
      modelType: mr.modelType,
      modelId: mr.modelId,
      roleName: mr.role.name,
      guard: mr.role.guardName,
      roleableId: mr.role.roleableId,
      roleableType: mr.role.roleableType,
    })),
    modelPermissions: modelPermissions.map((mp) => ({
      modelType: mp.modelType,
      modelId: mp.modelId,
      permissionName: mp.permission.name,
      guard: mp.permission.guardName,
    })),
  };
};

export const syncFromFiles = async (
  roleFilePath: string,
  permissionFilePath: string,
  mappingsFilePath: string,
  options: any = {}
) => {
  const roles = JSON.parse(fs.readFileSync(roleFilePath, "utf8"));
  const permissions = JSON.parse(fs.readFileSync(permissionFilePath, "utf8"));
  const mappings = JSON.parse(fs.readFileSync(mappingsFilePath, "utf8"));
  return syncRbacState(
    { roles, permissions, ...mappings },
    options
  );
};
