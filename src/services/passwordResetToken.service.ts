import { PrismaClient, DeviceType } from "@prisma/client";

const prisma = new PrismaClient();

export const resetLinkInsert = async (data: {
  email: string;
  token: string;
  expires_at: Date;
}) => {
  // Delete any existing OTPs for this phone
  await prisma.passwordResetToken.deleteMany({
    where: { email: data.email },
  });

  // Insert new OTP
  return prisma.passwordResetToken.create({ data });
};

export const deleteToken = async (id: number) => {
  // Delete any existing OTPs for this phone
  await prisma.passwordResetToken.deleteMany({
    where: { id: id },
  });
};
