import { z } from "zod";

export const TrackingRequestSchema = z.object({
  lat: z.number().min(-90).max(90), // ✅ Latitude range
  lng: z.number().min(-180).max(180), // ✅ Longitude range
  sender_id: z.number().int().positive(), // ✅ Sender is numeric ID
  receiver_id: z.number().int().positive(), // ✅ Receiver is numeric ID
});
