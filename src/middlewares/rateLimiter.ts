import { Request, Response, NextFunction } from "express";
import { createClient } from "redis";
import { error } from "@/utils/responseWrapper";
import { isProduction } from "@/config/env";
import { logger } from "@/utils/logger";
const config = require("../../config");

// In-memory rate limiting fallback
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

let redis: any = null;
// Only use Redis in production
if (isProduction) {
  redis = createClient({ url: config.db.redisUrl });
  redis.connect();
} else {
  logger.info("ℹ️ Redis disabled for rate limiting in local development");
}

export const rateLimiter = ({
  keyPrefix,
  limit = 5,
  windowInSeconds = 60,
}: {
  keyPrefix: string;
  limit?: number;
  windowInSeconds?: number;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.user?.id || req.ip || "unknown";
      const key = `${keyPrefix}:${identifier}`;

      if (redis && isProduction) {
        // Use Redis if available
        const current = await redis.incr(key);
        if (current === 1) {
          await redis.expire(key, windowInSeconds);
        }
        if (current > limit) {
          return res
            .status(429)
            .json(error("Too many requests. Please try again later."));
        }
      } else {
        // Use in-memory store for development
        const now = Date.now();
        const record = rateLimitStore.get(key);

        if (!record || now > record.resetTime) {
          const resetTime = now + windowInSeconds * 1000;
          rateLimitStore.set(key, { count: 1, resetTime });
        } else {
          record.count++;
          if (record.count > limit) {
            return res
              .status(429)
              .json(error("Too many requests. Please try again later."));
          }
        }
      }

      next();
  };
};

// import { rateLimiter } from "@/middlewares/rateLimiter";

// router.post(
//   "/auth/login",
//   rateLimiter({ keyPrefix: "login", limit: 5, windowInSeconds: 60 }),
//   validateRequest({ body: LoginRequestSchema }),
//   authController.loginUser
// );

// router.post(
//   "/auth/send/otp",
//   rateLimiter({ keyPrefix: "otp", limit: 3, windowInSeconds: 120 }),
//   validateRequest({ body: OtpRequestSchema }),
//   authController.sendOtp
// );
