import { z } from "zod";

export const AddMoneyRequestSchema = z.object({
  amount: z
    .number({ required_error: "Amount is required" })
    .positive("Amount must be greater than 0"),
});
