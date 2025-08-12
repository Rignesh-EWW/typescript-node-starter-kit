import { z } from "zod";

export const ChatRequestSchema = z.object({
  sender_type: z.enum(["user", "admin"]), // restrict possible values
  sender_id: z.number().int().positive(), // store as number for DB consistency
  receiver_type: z.enum(["user", "admin"]),
  receiver_id: z.number().int().positive(),
  message: z.string().min(1, "Message cannot be empty").max(1000), // optional if only starting chat
});
