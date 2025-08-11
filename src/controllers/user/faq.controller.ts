import { Request, Response, NextFunction } from "express";
import { success, error } from "@/utils/responseWrapper";
import { asyncHandler } from "@/utils/asyncHandler";
import { formatFaqsResponse } from "@/resources/user/faqs.resource";
import { getFaq } from "@/repositories/faq.repository";

export const faqList = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const faqs = await getFaq();
    // console.log(faqs);
    return res.json(success("Faq list", formatFaqsResponse(faqs)));
  }
);
