import { Request, Response, NextFunction } from "express";
import { success, error } from "@/utils/responseWrapper";
import { asyncHandler } from "@/utils/asyncHandler";
import { getAppLinks } from "@/repositories/appLink.repository";
import { formatAppLinkResponse } from "@/resources/user/appLink.resource";

export const appLinks = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const appLinks = await getAppLinks();
    // console.log(faqs);
    return res.json(success("App links list", formatAppLinkResponse(appLinks)));
  }
);
