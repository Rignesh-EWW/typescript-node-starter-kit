import { PrismaClient, Prisma, UserType } from "@prisma/client";

const prisma = new PrismaClient();

export const createMessage = async (data: {
  sender_type: UserType;
  sender_id: number;
  receiver_type: UserType;
  receiver_id: number;
  message: string;
}) => {
  return prisma.message.create({ data });
};
