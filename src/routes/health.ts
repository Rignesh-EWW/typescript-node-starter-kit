import { Router } from "express";
import { success } from "@/utils/responseWrapper";
import { StatusCode } from "@/constants/statusCodes";
const config = require("../../config");

const router = Router();

router.get("/", (req, res) => {
  res
    .status(StatusCode.OK)
    .json(
      success("Server is running", {
        uptime: process.uptime(),
        timestamp: Date.now(),
        version: config.app.version,
      })
    );
});

export default router;
