import { chatController } from "@/controllers/user/chat.controller";
import { Router } from "express";
import { requireAuth, requireUserAuth } from "@/middlewares/authMiddleware";
import validateRequest from "@/middlewares/validateRequest";
import { ChatRequestSchema } from "@/requests/user/chat.request";

const router = Router();

router.post(
  "/send-message",
  requireUserAuth,
  validateRequest({ body: ChatRequestSchema }),
  chatController.sendMessage
);

export default router;
