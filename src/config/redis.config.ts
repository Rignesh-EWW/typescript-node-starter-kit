// Conditional Redis import to avoid connection attempts in development
import { isProduction } from "@/config/env";
import { logger } from "@/utils/logger";
const config = require("../../config");

let redisClient: any = null;

if (isProduction) {
  const Redis = require("ioredis");
  redisClient = new Redis({
    host: config.db.host,
    port: config.db.port,
    password: config.db.password,
  });
  logger.info("✅ Redis client created for production");
} else {
  logger.info("ℹ️ Redis client disabled for development");
}

export { redisClient };
