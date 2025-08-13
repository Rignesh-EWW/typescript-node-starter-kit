import { PrismaClient } from "@prisma/client";
import { UserEntity } from "@/domain/entities/user.entity";
import { mediaService } from "@/services/media.service";

const prisma = new PrismaClient();

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const findUserByPhone = async (phone: string) => {
  return prisma.user.findUnique({ where: { phone } });
};

export const findUserById = async (id: number): Promise<UserEntity | null> => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      media: {
        where: { collection_name: "profile_image" },
        orderBy: { id: "desc" },
        take: 1,
      },
    },
  });
  if (!user) return null;

  const profileImageUrl = user.media?.[0]
    ? `${process.env.BASE_URL}${mediaService.urlFor(user.media[0])}`
    : null;

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
    user.language,
    user.notifications_enabled,
    user.wallet_balance,
    profileImageUrl
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
    where: {
      ...(Object.keys(whereClause).length > 0 ? whereClause : {}),
      deleted_at: null,
    },
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
      wallet_balance: true,
      updated_at: true,
      deleted_at: true,
    },
  });
};

export const findUserWithPasswordById = async (id: number) => {
  return prisma.user.findUnique({ where: { id } });
};
