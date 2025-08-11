import { PrismaClient, DeviceType } from "@prisma/client";

const prisma = new PrismaClient();

export const insertOTP = async (data: { phone: string; otp: string }) => {
  // Delete any existing OTPs for this phone
  await prisma.oTPVerification.deleteMany({
    where: { phone: data.phone },
  });

  // Insert new OTP
  return prisma.oTPVerification.create({ data });
};

export const deleteOTP = async (id: number) => {
  // Delete any existing OTPs for this phone
  await prisma.oTPVerification.deleteMany({
    where: { id: id },
  });
};
