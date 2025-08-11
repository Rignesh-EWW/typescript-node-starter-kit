import { Request, Response, NextFunction } from "express";
import {
  ExportUserParamSchema,
  ImportUserBodySchema,
} from "@/requests/admin/export.request";
import { getAllUsersForExport } from "@/repositories/user.repository";
import { logUserExport } from "@/jobs/export.jobs";
import { asyncHandler } from "@/utils/asyncHandler";
import { error, success } from "@/utils/responseWrapper";
import {
  importUsersFromExcel,
  importUsersFromCSV,
  exportUsersToCSV,
  exportUsersToXLSX,
  generateExportFileName,
} from "@/services/user.service";
import { z } from "zod";

export const exportUsersHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { type } = ExportUserParamSchema.parse(req.params);
    const users = await getAllUsersForExport();

    const fileName = generateExportFileName(type);

    if (type === "csv") {
      const csv = await exportUsersToCSV(users);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      res.setHeader("Content-Type", "text/csv");
      logUserExport("csv");
      return res.status(200).send(csv);
    }

    if (type === "xlsx") {
      const buffer = await exportUsersToXLSX(users);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      logUserExport("xlsx");
      return res.status(200).send(buffer);
    }

    return res.status(400).json(error("Unsupported export type"));
  }
);

export const importUsersHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = ImportUserBodySchema.parse(req.body);
    const users = await importUsers(body);

    if (users.length === 0) {
      return next(new Error("No users imported"));
    }

    return res.json(success("Users imported successfully", users));
  }
);

const importUsers = async (
  body: z.infer<typeof ImportUserBodySchema> & { file: File }
) => {
  const { file, type } = body;
  const users =
    type === "xlsx"
      ? await importUsersFromExcel(file)
      : await importUsersFromCSV(file);
  return users;
};
