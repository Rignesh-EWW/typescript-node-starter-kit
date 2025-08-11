import { Request, Response, NextFunction } from "express";
import { GetAppSettingsRequestSchema } from "@/requests/admin/appSetting.request";
import { findAllAppSettings } from "@/repositories/appSetting.repository";
import { formatAppSettingsList } from "@/resources/admin/appSetting.resource";
import { asyncHandler } from "@/utils/asyncHandler";
import { CreateAppSettingRequestSchema } from "@/requests/admin/appSetting.request";
import { createAppSetting } from "@/services/appSetting.actions";
import { formatAppSetting } from "@/resources/admin/appSetting.resource";
import { logAppSettingCreated } from "@/jobs/appSetting.jobs";
import {
  UpdateAppSettingRequestSchema,
  UpdateAppSettingParamSchema,
} from "@/requests/admin/appSetting.request";
import { updateAppSetting } from "@/services/appSetting.actions";
import { logAppSettingUpdated } from "@/jobs/appSetting.jobs";
import { DeleteAppSettingParamSchema } from "@/requests/admin/appSetting.request";
import { softDeleteAppSetting } from "@/services/appSetting.actions";
import { logAppSettingDeleted } from "@/jobs/appSetting.jobs";
import { success, error } from "@/utils/responseWrapper";

export const getAppSettings = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = GetAppSettingsRequestSchema.parse(req.query);

    const { data, pagination } = await findAllAppSettings({
      page: parseInt(parsed.page),
      limit: parseInt(parsed.limit),
      sort_by: parsed.sort_by,
      order: parsed.order,
    });

    return res.json(
      success("App settings fetched", {
        settings: formatAppSettingsList(data),
        pagination,
      })
    );
  }
);


export const createAppSettingHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = CreateAppSettingRequestSchema.parse(req.body);

    const setting = await createAppSetting(body);

    logAppSettingCreated(body.app_type);

    return res.status(201).json(
      success("App setting created", formatAppSetting(setting))
    );
  }
);


export const updateAppSettingHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = UpdateAppSettingParamSchema.parse(req.params);
    const body = UpdateAppSettingRequestSchema.parse(req.body);

    const setting = await updateAppSetting(Number(id), body);

    logAppSettingUpdated(Number(id));

    return res.json(
      success("App setting updated", formatAppSetting(setting))
    );
  }
);


export const deleteAppSettingHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = DeleteAppSettingParamSchema.parse(req.params);

    await softDeleteAppSetting(Number(id));

    logAppSettingDeleted(Number(id));

    return res.json(success("App setting deleted successfully"));
  }
);
