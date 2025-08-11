import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getWalletTransactions = async (userId: number) => {
  return prisma.walletTransaction.findMany({
    where: { user_id: userId, deleted_at: null },
    orderBy: { id: "desc" },
  });
};
