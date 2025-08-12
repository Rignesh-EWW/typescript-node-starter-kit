import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getMessages = async (sender_id: number, receiver_id: number) => {
  return prisma.message.findMany({
    where: {
      deleted_at: null,
      OR: [
        { sender_id, receiver_id },
        { sender_id: receiver_id, receiver_id: sender_id },
      ],
    },
    orderBy: { id: "desc" },
  });
};
