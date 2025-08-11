import { PrismaClient } from "@prisma/client";
import { UserEntity } from "@/domain/entities/user.entity";

const prisma = new PrismaClient();

export const findUserByEmailResetToken = async (token: string) => {
  return prisma.passwordResetToken.findUnique({ where: { token: token } });
};
