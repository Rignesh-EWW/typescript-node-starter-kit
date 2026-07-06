import { Router } from "express";
import { success } from "@/utils/responseWrapper";
import { StatusCode } from "@/constants/statusCodes";
import { packageInfo } from "@/config/package.config";

const router = Router();

router.get("/", (req, res) => {
  res
    .status(StatusCode.OK)
    .json(
      success("Server is running", {
        uptime: process.uptime(),
        timestamp: Date.now(),
        name: packageInfo.name,
        version: packageInfo.version,
      })
    );
});

export default router;
