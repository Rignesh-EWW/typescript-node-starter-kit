import { z } from "zod";

export const AddCardRequestSchema = z.object({
  card_holder_name: z
    .string()
    .min(2, "Card holder name must be at least 2 characters long"),

  card_number: z
    .string()
    .regex(/^\d{16}$/, "Card number must be exactly 16 digits"),

  exp_date_month: z
    .string()
    .regex(/^(0[1-9]|1[0-2])$/, "Month must be between 01 and 12"),

  exp_date_year: z.string().regex(/^\d{4}$/, "Year must be 4 digits"),
});

export const DeleteCardRequestSchema = z.object({
  card_id: z.number().min(1, "Card id name must be at least 1 characters long"),
});
export const SetDefaultCardRequestSchema = z.object({
  card_id: z.number().min(1, "Card id name must be at least 1 characters long"),
});
