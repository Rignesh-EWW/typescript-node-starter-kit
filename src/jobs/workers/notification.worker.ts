import { Worker } from "bullmq";
import { createClient } from "redis";
import { isProduction } from "@/config/env";
import { logger } from "@/utils/logger";
const config = require("../../../config");

let connection: any = null;
let notificationWorker: any = null;

if (isProduction) {
  connection = createClient({ url: config.db.redisUrl });
  notificationWorker = new Worker(
    "notification",
    async (job) => {
      if (job.name === "pushInApp") {
        const { userId, title, body } = job.data;
        logger.info(
          `📲 Send notification to user#${userId}: ${title} - ${body}`
        );
        // TODO: call Notification.create() or Firebase push
      }
    },
    { connection }
  );

  notificationWorker.on("completed", (job) => {
    logger.info(`✅ Notification job ${job.id} sent`);
  });

  notificationWorker.on("failed", (job, err) => {
    logger.error(`❌ Notification job ${job?.id} failed:`, err.message);
  });
} else {
  logger.info("ℹ️ Notification worker disabled in development mode");
}

export { notificationWorker };
