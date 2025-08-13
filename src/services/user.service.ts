import {
  PrismaClient,
  DeviceType,
  Gender,
  Language,
  Prisma,
  OperationType,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { User } from "@sentry/node";
import { hashPassword } from "@utils/hash";
import { Parser } from "json2csv";
import XLSX from "xlsx";

const prisma = new PrismaClient();

export const createUser = async (data: {
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  dob: string;
  password: string;
  device_type: DeviceType;
  device_token: string;
  profile_image: string;
}) => {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      dob: data.dob ? new Date(data.dob) : null,
      gender: data.gender || "male",
      password: data.password,
      device_type: data.device_type,
      device_token: data.device_token,
    },
  });
};

export const updateUserById = async (
  id: number,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    gender?: Gender;
    dob?: string;
    status?: boolean;
    password?: string;
    device_type?: DeviceType;
    language?: Language;
    device_token?: string;
    notifications_enabled?: boolean;
  }
) => {
  return prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      dob: data.dob,
      gender: data.gender,
    },
  });
};

export const updateUserWalletBalance = async (
  userId: number,
  amount: number | string,
  operationType: "credit" | "debit"
) => {
  const decimalAmount = new Prisma.Decimal(amount);

  return prisma.user.update({
    where: { id: userId },
    data:
      operationType === "credit"
        ? {
            wallet_balance: {
              increment: decimalAmount,
            },
          }
        : {
            wallet_balance: {
              decrement: decimalAmount,
            },
          },
  });
};

export const toggleUserStatus = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");
  return prisma.user.update({
    where: { id },
    data: { status: !user.status },
  });
};

export const softDeleteUser = async (id: number) => {
  return prisma.user.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
};

export const changeUserPassword = async (
  userId: number,
  newPassword: string
) => {
  const hashedPassword = await hashPassword(newPassword);
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

export const importUsersFromExcel = async (file: File) => {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data: any[] = XLSX.utils.sheet_to_json(sheet);

  const createdUsers: User[] = [];
  for (const user of data) {
    const created = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        dob: user.dob || null,
        gender: user.gender || null,
        password: user.password || "",
      },
    });
    createdUsers.push(created);
  }
  return createdUsers;
};

export const importUsersFromCSV = async (file: File) => {
  const text = await file.text();
  const workbook = XLSX.read(text, { type: "string" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data: any[] = XLSX.utils.sheet_to_json(sheet);

  const createdUsers: User[] = [];
  for (const user of data) {
    const created = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        dob: user.dob || null,
        gender: user.gender || null,
        password: user.password || "",
      },
    });
    createdUsers.push(created);
  }
  return createdUsers;
};

export const exportUsersToCSV = async (users: any[]) => {
  return users.length ? new Parser().parse(users) : "";
};

export const exportUsersToXLSX = async (users: any[]) => {
  const ws = XLSX.utils.json_to_sheet(users);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users");
  return XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
};

export const generateExportFileName = (type: "csv" | "xlsx") => {
  const dateStr = new Date().toISOString().slice(0, 10);
  return `users_export_${dateStr}.${type}`;
};
