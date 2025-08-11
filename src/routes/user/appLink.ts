import { Router } from "express";

import { requireAuth, requireUserAuth } from "@/middlewares/authMiddleware";
import { appLinks } from "@controllers/user/appLink.controller";

const router = Router();

router.get("/appLinks", requireAuth, appLinks);

export default router;
