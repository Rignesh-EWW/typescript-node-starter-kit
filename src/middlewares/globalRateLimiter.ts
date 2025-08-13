import { Request, Response, NextFunction } from "express";
import { createClient } from "redis";
import { error } from "@/utils/responseWrapper";
import { isProduction } from "@/config/env";
import { logger } from "@/utils/logger";
const config = require("../../config");

// In-memory rate limiting fallback
const memoryStore = new Map<string, { count: number; resetTime: number }>();

let redis: any = null;
// Only use Redis in production
if (isProduction) {
  redis = createClient({ url: config.db.redisUrl });
  redis.connect();
} else {
  logger.info("ℹ️ Redis disabled for rate limiting in local development");
}

// ⏱ Route-specific limits
const RATE_LIMIT_RULES: Record<string, { limit: number; window: number }> = {
  "/auth/login": { limit: 5, window: 60 },
  "/auth/send/otp": { limit: 3, window: 120 },
  "/auth/forgot/password": { limit: 3, window: 120 },
  "/user/me": { limit: 15, window: 60 },
  "*": { limit: 100, window: 60 }, // default
};

export const globalRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const identifier = req.user?.id || req.ip;
  const path =
    Object.keys(RATE_LIMIT_RULES).find((key) =>
      req.originalUrl.startsWith(key)
    ) || "*";

  const { limit, window } = RATE_LIMIT_RULES[path];
  const redisKey = `rate:${path}:${identifier}`;

  if (redis) {
    // Use Redis if available
    const current = await redis.incr(redisKey);
    if (current === 1) {
      await redis.expire(redisKey, window);
    }

    if (current > limit) {
      return res.status(429).json(
        error("Too many requests — please slow down.", {
          route: path,
          retry_after: window,
        })
      );
    }
  } else {
    // Use in-memory store as fallback
    const now = Date.now();
    const key = `${path}:${identifier}`;
    const record = memoryStore.get(key);

    if (!record || now > record.resetTime) {
      memoryStore.set(key, { count: 1, resetTime: now + window * 1000 });
    } else {
      record.count++;
      if (record.count > limit) {
        return res.status(429).json(
          error("Too many requests — please slow down.", {
            route: path,
            retry_after: window,
          })
        );
      }
    }
  }

  next();
};
