import {
  PrismaClient,
  DeviceType,
  Gender,
  Language,
  Prisma,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { hashPassword } from "@/utils/hash";
import { Parser } from "json2csv";
import XLSX from "xlsx";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "profile_images");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  dob: string;
  password: string;
  device_type: DeviceType;
  device_token: string;
  profile_image?: string;
}

export interface UpdateUserData {
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
  profile_image?: string;
  notifications_enabled?: boolean;
}

export const createUser = async (data: any, file?: Express.Multer.File) => {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { phone: data.phone }],
      },
    });

    if (existingUser) {
      throw new Error(
        existingUser.email === data.email
          ? "User with this email already exists"
          : "User with this phone already exists"
      );
    }

    const hashedPassword = await hashPassword(data.password);

    // Handle profile image upload
    let profileImagePath: string | null = null;
    if (file) {
      // File uploaded via multer
      profileImagePath = `uploads/profile_images/${file.filename}`;
    } else if (data.profile_image) {
      // Base64 image provided
      profileImagePath = data.profile_image;
    }

    const userData: Prisma.UserCreateInput = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      dob: data.dob ? new Date(data.dob) : null,
      gender: data.gender || "male",
      password: hashedPassword,
      device_type: data.device_type || "web",
      device_token: data.device_token || "",
      profile_image: profileImagePath,
      status: true,
      language: "en",
      wallet_balance: new Decimal(0.0),
      notifications_enabled: true,
    };

    const user = await prisma.user.create({
      data: userData,
    });

    return user;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("User with this email or phone already exists");
      }
    }
    throw error;
  }
};

export const updateUserById = async (
  id: number,
  data: UpdateUserData,
  file?: Express.Multer.File
) => {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, phone: true, profile_image: true },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Check for unique constraints if email or phone is being updated
    if (data.email || data.phone) {
      const duplicateCheck = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(data.email ? [{ email: data.email }] : []),
                ...(data.phone ? [{ phone: data.phone }] : []),
              ],
            },
          ],
        },
      });

      if (duplicateCheck) {
        throw new Error(
          duplicateCheck.email === data.email
            ? "User with this email already exists"
            : "User with this phone already exists"
        );
      }
    }

    const updateData: Prisma.UserUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.dob !== undefined)
      updateData.dob = data.dob ? new Date(data.dob) : null;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.password !== undefined)
      updateData.password = await hashPassword(data.password);
    if (data.device_type !== undefined)
      updateData.device_type = data.device_type;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.device_token !== undefined)
      updateData.device_token = data.device_token;
    if (data.notifications_enabled !== undefined)
      updateData.notifications_enabled = data.notifications_enabled;

    // Handle profile image upload
    if (file || data.profile_image) {
      // Delete old profile image if it exists
      if (existingUser.profile_image) {
        const oldImagePath = path.join(
          process.cwd(),
          existingUser.profile_image
        );
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch (err) {
            console.error(`Failed to delete old profile image: ${err}`);
          }
        }
      }

      // Set new profile image path
      if (file) {
        // File uploaded via multer
        updateData.profile_image = `uploads/profile_images/${file.filename}`;
      } else if (data.profile_image) {
        // Base64 image provided
        updateData.profile_image = data.profile_image;
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return updated;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("User with this email or phone already exists");
      }
      if (error.code === "P2025") {
        throw new Error("User not found");
      }
    }
    throw error;
  }
};

export const toggleUserStatus = async (id: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return await prisma.user.update({
      where: { id },
      data: { status: !user.status },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error("User not found");
      }
    }
    throw error;
  }
};

export const softDeleteUser = async (id: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return await prisma.user.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error("User not found");
      }
    }
    throw error;
  }
};

export const changeUserPassword = async (
  userId: number,
  newPassword: string
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const hashedPassword = await hashPassword(newPassword);
    return await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error("User not found");
      }
    }
    throw error;
  }
};

export const importUsersFromExcel = async (file: any) => {
  try {
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(sheet);

    const createdUsers: any[] = [];
    for (const user of data) {
      if (user.name && user.email) {
        const hashedPassword = await hashPassword(
          user.password || "defaultPassword123"
        );

        const created = await prisma.user.create({
          data: {
            name: user.name,
            email: user.email,
            phone: user.phone || `imported_${Date.now()}_${Math.random()}`,
            dob: user.dob ? new Date(user.dob) : null,
            gender: user.gender || "male",
            password: hashedPassword,
            device_type: "web",
            device_token: "",
            status: true,
            language: "en",
            wallet_balance: new Decimal(0.0),
            notifications_enabled: true,
          },
        });
        createdUsers.push(created);
      }
    }
    return createdUsers;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Failed to import users from Excel: ${errorMessage}`);
  }
};

export const importUsersFromCSV = async (file: any) => {
  try {
    const text = file.buffer.toString();
    const workbook = XLSX.read(text, { type: "string" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(sheet);

    const createdUsers: any[] = [];
    for (const user of data) {
      if (user.name && user.email) {
        const hashedPassword = await hashPassword(
          user.password || "defaultPassword123"
        );

        const created = await prisma.user.create({
          data: {
            name: user.name,
            email: user.email,
            phone: user.phone || `imported_${Date.now()}_${Math.random()}`,
            dob: user.dob ? new Date(user.dob) : null,
            gender: user.gender || "male",
            password: hashedPassword,
            device_type: "android",
            device_token: "",
            status: true,
            language: "en",
            wallet_balance: new Decimal(0.0),
            notifications_enabled: true,
          },
        });
        createdUsers.push(created);
      }
    }
    return createdUsers;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Failed to import users from CSV: ${errorMessage}`);
  }
};

export const exportUsersToCSV = async (users: any[]) => {
  try {
    return users.length ? new Parser().parse(users) : "";
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Failed to export users to CSV: ${errorMessage}`);
  }
};

export const exportUsersToXLSX = async (users: any[]) => {
  try {
    const ws = XLSX.utils.json_to_sheet(users);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    return XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Failed to export users to XLSX: ${errorMessage}`);
  }
};

export const generateExportFileName = (type: "csv" | "xlsx") => {
  const dateStr = new Date().toISOString().slice(0, 10);
  return `users_export_${dateStr}.${type}`;
};

// Helper function to delete profile image file
export const deleteProfileImage = async (imagePath: string | null) => {
  if (!imagePath) return;

  try {
    const fullPath = path.join(process.cwd(), imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted profile image: ${imagePath}`);
    }
  } catch (error) {
    console.error(`Failed to delete profile image ${imagePath}:`, error);
  }
};

// Helper function to get file extension from mimetype
export const getFileExtension = (mimetype: string): string => {
  const extensions: { [key: string]: string } = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
  };
  return extensions[mimetype] || ".jpg";
};

// Helper function to validate image file
export const validateImageFile = (file: Express.Multer.File): boolean => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  return allowedMimes.includes(file.mimetype) && file.size <= maxSize;
};
