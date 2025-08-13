require('dotenv/config');
const path = require('path');

const config = {
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  db: {
    redisUrl: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  token: {
    jwtSecret: process.env.JWT_SECRET || "secret",
    authSecretKey: process.env.AUTH_SECRET_KEY,
    sessionSecret: process.env.SESSION_SECRET || "your-secret-key",
  },
  mail: {
    from: process.env.MAIL_FROM || "no-reply@smartinbox.ai",
    resetPasswordLinkPrefix:
      process.env.RESET_PASSWORD_LINK_PREFIX ||
      "http://localhost:3000/api/reset-password/",
    adminResetPasswordUrl:
      process.env.ADMIN_RESET_PASSWORD_URL || "http://localhost:3000",
  },
  sentry: {
    dsn: process.env.SENTRY_DSN || "",
  },
  app: {
    baseUrl: process.env.BASE_URL || "",
    port: Number(process.env.PORT || 3000),
    url: process.env.APP_URL || "",
    nodeEnv: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version,
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY,
    iv: process.env.ENCRYPTION_KEY_IV,
  },
  storage: {
    local: {
      urlPrefix: process.env.LOCAL_STORAGE_URL_PREFIX || "/uploads",
      path: process.env.LOCAL_STORAGE_PATH || path.join(process.cwd(), "uploads"),
    },
    aws: {
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_S3_BUCKET,
      baseUrl: process.env.AWS_S3_BASE_URL,
    },
    driver: process.env.STORAGE_DRIVER || "local",
  },
};

module.exports = config;
