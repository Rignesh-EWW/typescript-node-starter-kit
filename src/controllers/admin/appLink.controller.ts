import { Request, Response, NextFunction } from "express";
import { getAppLinks } from "@/repositories/appLink.repository";
import { formatAppLinksList } from "@/resources/admin/appLink.resource";
import { asyncHandler } from "@/utils/asyncHandler";
import { success, error } from "@/utils/responseWrapper";

export const getAppLinksHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const links = await getAppLinks();
    return res.json(success("Links fetched", formatAppLinksList(links)));
  }
);

import {
  UpdateAppLinkBodySchema,
  UpdateAppLinkParamSchema,
} from "@/requests/admin/appLink.request";
import { updateAppLinkById } from "@/services/appLink.service";
import { logAppLinkUpdate } from "@/jobs/appLink.jobs";
import { formatAppLink } from "@/resources/admin/appLink.resource";

export const updateAppLinkHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = UpdateAppLinkParamSchema.parse(req.params);
    const { value } = UpdateAppLinkBodySchema.parse(req.body);

    const updated = await updateAppLinkById(Number(id), { value });

    logAppLinkUpdate(Number(id));

    return res.json(
      success("Link updated", formatAppLink(updated))
    );
  }
);
