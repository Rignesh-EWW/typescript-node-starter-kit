// middleware/locale.ts
import { loadLocales } from "@/utils/locale";
import { Request, Response, NextFunction } from "express";

export const setLocale = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const lang = (req.headers["accept-language"] as string) || "en";
  req.translator = await loadLocales(lang);
  next();
};
