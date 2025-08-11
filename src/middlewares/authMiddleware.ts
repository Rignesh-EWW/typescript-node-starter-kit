import { Request, Response, NextFunction } from "express";
import { Messages } from "@/constants/messages";
import { verifyAuthToken } from "@/utils/authToken";
import { verifyJwt } from "@/utils/jwt";
import { error } from "@/utils/responseWrapper";

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
    return res.status(401).json(error(req.translator.t(Messages.unauthorized)));
  }

  req.user = user;
  next();
};
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json(error(req.translator.t(Messages.unauthorized)));
  }

  const expectedToken = process.env.AUTH_SECRET_KEY;
  if (!expectedToken || authHeader !== expectedToken) {
    return res.status(401).json(error(req.translator.t(Messages.unauthorized)));
  }

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
    return res.status(401).json(error("Unauthorized"));
  }

  req.user = user;
  next();
};
