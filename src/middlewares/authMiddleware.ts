import { Request, Response, NextFunction } from "express";
import { Messages } from "../constants/messages";
import { verifyAuthToken } from "../utils/authToken";
import { verifyJwt } from "../utils/jwt";

export const requireUserAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let user = (req.session as any)?.user;

  if (!user) {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith("Bearer ")) {
      const token = auth.substring(7);
      const payload = verifyAuthToken<{ id: number; role: string }>(token);
//       const payload = verifyJwt<{ id: number; role: string }>(token);
      if (payload) {
        user = { id: payload.id, role: payload.role as any };
      }
    }
  }

  if (!user || user.role !== "user") {
    return res.status(401).json({ message: Messages.unauthorized });
  }

  req.user = user;
  next();
};

export const requireAdminAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let user = (req.session as any)?.user;

  if (!user) {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith("Bearer ")) {
      const token = auth.substring(7);
      const payload = verifyAuthToken<{ id: number; role: string }>(token);
//       const payload = verifyJwt<{ id: number; role: string }>(token);
      if (payload) {
        user = { id: payload.id, role: payload.role as any };
      }
    }
  }

  if (!user || user.role !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = user;
  next();
};
