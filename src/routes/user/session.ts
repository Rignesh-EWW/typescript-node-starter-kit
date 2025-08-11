import { Router } from "express";
import { logout } from "@/controllers/user/session.controller";
import { requireUserAuth } from "@/middlewares/authMiddleware";
import { logRoute } from "@/decorators/logRoute";

const router = Router();

router.get("/logout", logRoute("LOGOUT"), requireUserAuth, logout);

export default router;
