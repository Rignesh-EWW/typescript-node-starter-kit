import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Configure multer for profile image uploads
const createProfileImageStorage = () => {
  return multer.diskStorage({
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
};

// File filter for profile images
const profileImageFilter = (
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

// Create multer instance for profile images
export const profileImageUpload = multer({
  storage: createProfileImageStorage(),
  fileFilter: profileImageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Generic file storage configuration
export const createFileStorage = (uploadPath: string, subfolder?: string) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = subfolder
        ? path.join(process.cwd(), uploadPath, subfolder)
        : path.join(process.cwd(), uploadPath);

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
};

// Generic file filter
export const createFileFilter = (allowedMimes: string[]) => {
  return (
    req: any,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${allowedMimes.join(", ")} files are allowed`));
    }
  };
};

// Create multer instance with custom configuration
export const createMulterInstance = (
  uploadPath: string,
  subfolder?: string,
  allowedMimes: string[] = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ],
  maxFileSize: number = 5 * 1024 * 1024 // 5MB default
) => {
  return multer({
    storage: createFileStorage(uploadPath, subfolder),
    fileFilter: createFileFilter(allowedMimes),
    limits: {
      fileSize: maxFileSize,
    },
  });
};

// Helper function to delete file
export const deleteFile = async (filePath: string | null): Promise<void> => {
  if (!filePath) return;

  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Failed to delete file ${filePath}:`, error);
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
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      ".docx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      ".xlsx",
  };
  return extensions[mimetype] || ".file";
};

// Helper function to validate file
export const validateFile = (
  file: Express.Multer.File,
  allowedMimes: string[],
  maxSize: number
): boolean => {
  return allowedMimes.includes(file.mimetype) && file.size <= maxSize;
};

// Predefined multer instances for common use cases
export const documentUpload = createMulterInstance(
  "uploads",
  "documents",
  [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  10 * 1024 * 1024 // 10MB
);

export const imageUpload = createMulterInstance(
  "uploads",
  "images",
  ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  5 * 1024 * 1024 // 5MB
);

export const excelUpload = createMulterInstance(
  "uploads",
  "excel",
  [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ],
  10 * 1024 * 1024 // 10MB
);

// Export the original profile image upload for backward compatibility
export const upload = profileImageUpload;
