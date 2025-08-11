import { Router } from "express";
import authRoutes from "@/routes/admin/auth";
import profileRoutes from "@/routes/admin/profile";
// import dashboardRoutes from "@/routes/admin/dashboard";
import appSettingRoutes from "@/routes/admin/appSetting";
import appLinkRoutes from "@/routes/admin/appLink";
import appVariableRoutes from "@/routes/admin/appVariable";
import userRoutes from "@/routes/admin/user";
import importExportRoutes from "@/routes/admin/importExport";
import adminUserRoutes from "@/routes/admin/adminUser";

const router = Router();

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
// router.use("/dashboard", dashboardRoutes);
router.use("/", appSettingRoutes);
router.use("/", appLinkRoutes);
router.use("/", appVariableRoutes);
router.use("/admin-user", adminUserRoutes);
router.use("/user", userRoutes);
router.use("/user", importExportRoutes);

export default router;
