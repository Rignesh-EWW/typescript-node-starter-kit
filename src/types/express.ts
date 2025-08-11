import "express";
import i18next from "i18next";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: "user" | "admin";
      };
    }
  }
}

declare module "express-serve-static-core" {
  interface Request {
    translator: typeof i18next;
  }
}

export {};
