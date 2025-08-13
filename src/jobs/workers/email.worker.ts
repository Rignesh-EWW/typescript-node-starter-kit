import { Worker } from "bullmq";
import { createClient } from "redis";
import { sendEmail } from "@utils/mailer";
import { userWelcomeEmail } from "@/templates/mail/userWelcomeEmail";
import { isProduction } from "@/config/env";
import { logger } from "@/utils/logger";
const config = require("../../../config");

let connection: any = null;
let emailWorker: any = null;

if (isProduction) {
  connection = createClient({ url: config.db.redisUrl });
  emailWorker = new Worker(
    "email",
    async (job) => {
      if (job.name === "sendWelcomeEmail") {
        const { email, name, otp } = job.data;
        const { subject, html } = userWelcomeEmail(name, otp);

        await sendEmail({ to: email, subject, html });
      }
    },
    { connection }
  );

  emailWorker.on("completed", (job) => {
    logger.info(`✅ Job ${job.id} completed`);
  });

  emailWorker.on("failed", (job, err) => {
    logger.error(`❌ Job ${job?.id} failed:`, err.message);
  });
} else {
  logger.info("ℹ️ Email worker disabled in development mode");
}

export { emailWorker };
