import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export const createContactUs = async (data: {
  full_name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  return prisma.contactUs.create({ data });
};
