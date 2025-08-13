import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { success, error } from "@/utils/responseWrapper";
import {
  getFaq,
  createFaq,
  updateFaq,
  deleteFaq,
  toggleFaqStatus,
  getFaqById,
} from "@/repositories/faq.repository";
import {
  UpdateFaqBodySchema,
  CreateFaqBodySchema,
  FaqIdParamSchema,
} from "@/requests/admin/faq.request";
import { formatFaq, formatFaqList } from "@/resources/admin/faq.resource";

export const getFaqListHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const faqs = await getFaq();
    return res.json(success("FAQ list fetched", formatFaqList(faqs)));
  }
);

export const createFaqHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = CreateFaqBodySchema.parse(req.body);
    const faq = await createFaq(data);
    return res.json(success("FAQ created", formatFaq(faq)));
  }
);

export const updateFaqHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = FaqIdParamSchema.parse(req.params);
    const data = UpdateFaqBodySchema.parse(req.body);
    const updatedFaq = await updateFaq(Number(id), data);
    return res.json(success("FAQ updated", updatedFaq));
  }
);

export const deleteFaqHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = FaqIdParamSchema.parse(req.params);
    await deleteFaq(Number(id));
    return res.json(success("FAQ deleted"));
  }
);

export const toggleFaqStatusHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = FaqIdParamSchema.parse(req.params);
    const faq = await toggleFaqStatus(Number(id));
    return res.json(success("FAQ status toggled", formatFaq(faq)));
  }
);

export const getFaqHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = FaqIdParamSchema.parse(req.params);
    const faq = await getFaqById(Number(id));
    return res.json(success("FAQ fetched", formatFaq(faq)));
  }
);
