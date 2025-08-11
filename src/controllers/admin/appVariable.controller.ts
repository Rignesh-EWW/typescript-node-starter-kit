import { Request, Response, NextFunction } from "express";
import { getAppVariables } from "@/repositories/appVariable.repository";
import { formatAppVariableList } from "@/resources/admin/appVariable.resource";
import { asyncHandler } from "@/utils/asyncHandler";
import { CreateAppVariableSchema } from "@/requests/admin/appVariable.request";
import { createAppVariable } from "@/services/appVariable.service";
import { logAppVariableCreated } from "@/jobs/appVariable.jobs";
import { formatAppVariable } from "@/resources/admin/appVariable.resource";
import {
  UpdateAppVariableParamSchema,
  UpdateAppVariableBodySchema,
} from "@/requests/admin/appVariable.request";
import { updateAppVariable } from "@/services/appVariable.service";
import { logAppVariableUpdated } from "@/jobs/appVariable.jobs";
import { success, error } from "@/utils/responseWrapper";



export const getAppVariablesHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const vars = await getAppVariables();
    return res.json(success("Variables fetched", formatAppVariableList(vars)));
  }
);

export const createAppVariableHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = CreateAppVariableSchema.parse(req.body);

    const variable = await createAppVariable(body);
    logAppVariableCreated(body.name);

    return res.status(201).json(
      success("App variable created", formatAppVariable(variable))
    );
  }
);

export const updateAppVariableHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = UpdateAppVariableParamSchema.parse(req.params);
    const body = UpdateAppVariableBodySchema.parse(req.body);

    const updated = await updateAppVariable(Number(id), body);
    logAppVariableUpdated(Number(id));

    return res.json(
      success("App variable updated", formatAppVariable(updated))
    );
  }
);
