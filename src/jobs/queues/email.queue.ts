import { Queue } from "bullmq";
import { isProduction } from "@/config/env";
import { logger } from "@/utils/logger";
const config = require("../../../config");

class MockQueue {
  async add() {
    logger.warn(
      "ℹ️ Email queue is disabled in development. Job not queued."
    );
  }
}

export const emailQueue =
  isProduction
    ? new Queue("email", {
        connection: {
          host: config.db.host,
          port: config.db.port,
          password: config.db.password,
        },
      })
    : (new MockQueue() as any);
