import { Router } from "express";

import { requireAuth, requireUserAuth } from "@/middlewares/authMiddleware";
import { faqList } from "@controllers/user/faq.controller";

const router = Router();

router.get("/faq", requireAuth, faqList);

export default router;
