import { Router } from "express";
import initRoutes from "@/routes/user/init";
import authRoutes from "@/routes/user/auth";
import profileRoutes from "@/routes/user/profile";
import passwordRoutes from "@/routes/user/password";
import sessionRoutes from "@/routes/user/session";
import notificationRoutes from "@/routes/user/notification";
import faqRoutes from "@/routes/user/faq";
import appMenuLink from "@/routes/user/appLink";
import cardRoutes from "@/routes/user/card";
import addressRoutes from "@/routes/user/address";
import walletRoutes from "@/routes/user/wallet";
import contactUsRoutes from "@/routes/user/contractUs";
import chatRoutes from "@/routes/user/chat";

const router = Router();

router.use("/", initRoutes);
router.use("/", authRoutes);
router.use("/", profileRoutes);
router.use("/", passwordRoutes);
router.use("/", sessionRoutes);
router.use("/", notificationRoutes);
router.use("/", faqRoutes);
router.use("/", appMenuLink);
router.use("/", cardRoutes);
router.use("/", addressRoutes);
router.use("/", walletRoutes);
router.use("/", contactUsRoutes);
router.use("/", chatRoutes);

export default router;
