import { Router } from "express";
import { packageInfo } from "../config/package.config";
import { success } from "../utils/responseWrapper";

const router = Router();

router.get("/", (req, res) => {
  res
    .status(200)
    .json(
      success("Server is running", {
        name: packageInfo.name,
        uptime: process.uptime(),
        timestamp: Date.now(),
        version: packageInfo.version,
      })
    );
});

export default router;
