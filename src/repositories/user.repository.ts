import { PrismaClient } from "@prisma/client";
import { UserEntity } from "@/domain/entities/user.entity";

const prisma = new PrismaClient();

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const findUserByPhone = async (phone: string) => {
  return prisma.user.findUnique({ where: { phone } });
};

export const findUserById = async (id: number): Promise<UserEntity | null> => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;
  const dobString = user.dob ? user.dob.toISOString() : null;
  return new UserEntity(
    user.id,
    user.name,
    user.email,
    user.phone,
    user.gender,
    dobString,
    user.device_type,
    user.device_token,
    user.profile_image,
    user.language,
    user.notifications_enabled,
    user.wallet_balance
  );
};

export const getAllUsers = async (
  offset: number,
  limit: number,
  search?: string
) => {
  let whereClause: any = {};

  if (typeof search === "string" && search.trim() !== "") {
    whereClause.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  return prisma.user.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    orderBy: { created_at: "desc" },
    skip: offset,
    take: limit,
  });
};

export const getAllUsersForExport = async () => {
  return prisma.user.findMany({
    where: { deleted_at: null },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      gender: true,
      dob: true,
      status: true,
      created_at: true,
      profile_image: true,
      wallet_balance: true,
      updated_at: true,
      deleted_at: true,
    },
  });
};

export const findUserWithPasswordById = async (id: number) => {
  return prisma.user.findUnique({ where: { id } });
};
