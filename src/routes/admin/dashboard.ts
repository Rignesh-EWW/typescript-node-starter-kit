import { Router } from "express";
import { dashboardHandler } from "@/controllers/admin/dashboard.controller";
import { requireAdminAuth } from "@/middlewares/authMiddleware";
import { logRoute } from "@/decorators/logRoute";

const router = Router();

router.get("/", dashboardHandler);
