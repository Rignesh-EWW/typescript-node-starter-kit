import { PrismaClient } from "@prisma/client";
import { AdminEntity } from "@/domain/entities/admin.entity";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const findAdminByEmail = async (email: string): Promise<any | null> => {
  return prisma.admin.findUnique({ where: { email } });
};

export const findAdminById = async (
  id: number
): Promise<AdminEntity | null> => {
  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) return null;
  return new AdminEntity(admin.id, admin.name, admin.email);
};

export const getAllAdmins = async (userId: number) => {
  return prisma.admin.findMany({
    where: {
      id: {
        not: userId,
      },
    },
  });
};

export const createAdmin = async (
  name: string,
  email: string,
  password: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({
    data: { name, email, password: hashedPassword },
  });
  return admin;
};

export const updateAdminUser = async (
  id: number,
  data: { name: string; email: string; password: string }
) => {
  const hashedPassword = data.password
    ? await bcrypt.hash(data.password, 10)
    : undefined;
  const admin = await prisma.admin.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });
  return admin;
};

export const deleteAdminUser = async (id: number) => {
  const admin = await prisma.admin.delete({ where: { id } });
  return admin;
};

export const updateAdminPassword = async (id: number, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.update({
    where: { id },
    data: { password: hashedPassword },
  });
  return admin;
};

export const updateAdminProfile = async (
  id: number,
  data: { name: string; email: string }
) => {
  const admin = await prisma.admin.update({
    where: { id },
    data: { name: data.name, email: data.email },
  });
  return admin;
};
