import { PrismaClient } from "@prisma/client";
import { UserEntity } from "@/domain/entities/user.entity";

const prisma = new PrismaClient();

export const findUserByPhoneAndOTP = async ({
  phone,
  otp,
}: {
  phone: string;
  otp: string;
}) => {
  return prisma.oTPVerification.findFirst({
    where: {
      phone,
      otp,
    },
  });
};
