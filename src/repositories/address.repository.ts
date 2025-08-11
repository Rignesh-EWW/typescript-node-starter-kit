import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAddress = async (userId: number) => {
  return prisma.address.findMany({
    where: { user_id: userId, deleted_at: null },
    orderBy: { id: "asc" },
  });
};

export const getExistAddress = async (user_id: number) => {
  return prisma.address.findFirst({
    where: {
      user_id,
    },
  });
};

export const findAddressById = async (id: number) => {
  return prisma.address.findUnique({ where: { id } });
};
