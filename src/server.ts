import express from "express";
import helmet from "helmet";
import compression from "compression";
import { createServer } from "http";
import session from "express-session";
import { logger } from "@/utils/logger";
import { redisClient } from "@/config/redis.config";
import RedisStore from "connect-redis";
import { isProduction } from "@/config/env";
import { setLocale } from "@/middlewares/locale";
// import { errorHandler } from "@/middlewares/errorHandler";
import corsConfig from "@/config/cors.config";
import sessionConfig from "@/config/session.config";
import { globalRateLimiter } from "@/middlewares/globalRateLimiter";
import { globalErrorHandler } from "@/middlewares/errorHandler";
import { requestLogger } from "@/middlewares/requestLogger";
import { success, error } from "@/utils/responseWrapper";
import { StatusCode } from "@/constants/statusCodes";
// import "@/events/listeners/user.listener";
// import "@/events/listeners/admin.listener";

// Routes
import userRoutes from "@/api/user.routes";
import adminRoutes from "@/api/admin.routes";
import healthRoutes from "@/api/health.routes";
import docsRoutes from "@/api/docs.routes";
import bullBoardRoutes from "@/api/bull.routes";
import resetViewRoutes from "@/routes/reset.view";

import type { Server } from "http";
import path from "path";
import { Server as SocketIOServer } from "socket.io";

export const startServer = async (): Promise<Server> => {
  const app = express();
  const httpServer = createServer(app);

  // Try to connect to Redis, but don't fail if it's not available
  let redisStore: any = undefined;
  if (redisClient && isProduction) {
    if (redisClient.status !== "ready" && redisClient.status !== "connecting") {
      await redisClient.connect();
    }
    redisStore = new (RedisStore as any)({ client: redisClient });
    logger.info("✅ Redis connected successfully");
  } else {
    logger.info("ℹ️ Redis disabled for local development");
  }

  // ✅ Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // Or your frontend URL
      methods: ["GET", "POST"],
    },
  });
  // Store io instance in app so controllers can use it
  app.set("io", io);

  // Socket.IO events
  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    socket.on("join_room", (req) => {
      socket.join(req.type + "_" + req.id);
      console.log(`📦 User ${socket.id} joined room ${req.type}_${req.id}`);
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });

  // Middleware
  app.use((req, res, next) => {
    if (typeof res.setHeader !== "function") {
      logger.error("res.setHeader is not a function!", res);
      return next(new Error("res.setHeader is not a function"));
    }
    next();
  });
  app.use(corsConfig);
  app.use(helmet());
  app.use(compression());
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // app.use(
  //   session({
  //     store: redisStore,
  //     ...sessionConfig,
  //   })
  // );
  app.use(requestLogger);
  app.use(globalRateLimiter);
  app.use(setLocale);

  // root route
  app.get("/", (req, res) => {
    res.status(StatusCode.OK).json(success("Hello World !!"));
  });

  // Password reset view
  app.use("/", resetViewRoutes);

  // Health check
  app.use("/api/health", healthRoutes);

  // User routes
  app.use("/api/user", userRoutes);
  app.use("/api/admin", adminRoutes);
  // app.use("/api/docs", docsRoutes);
  // app.use("/api/admin/queues", bullBoardRoutes);

  // Error handler (should be last)
  app.use(globalErrorHandler);

  const PORT = process.env.PORT || 3000;
  await new Promise<void>((resolve) => {
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      resolve();
    });
  });

  return httpServer;
};
