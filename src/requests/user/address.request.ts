import { z } from "zod";

export const AddAddressRequestSchema = z.object({
  address_type: z.enum(["home", "work", "other"], {
    required_error: "Address type is required",
    invalid_type_error: "Address type must be one of: home, work, other",
  }),

  full_address: z
    .string()
    .min(2, "Full address must be at least 2 characters long"),

  lat: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),

  lng: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),

  house_number: z
    .string()
    .min(1, "House number must be at least 1 character long"),
});

export const UpdateAddressRequestSchema = z.object({
  address_id: z
    .number({
      required_error: "Address ID is required",
      invalid_type_error: "Address ID must be a number",
    })
    .min(1, "Address ID must be at least 1"),

  address_type: z.enum(["home", "work", "other"], {
    required_error: "Address type is required",
    invalid_type_error: "Address type must be one of: home, work, other",
  }),

  full_address: z
    .string()
    .min(2, "Full address must be at least 2 characters long"),

  lat: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),

  lng: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),

  house_number: z
    .string()
    .min(1, "House number must be at least 1 character long"),
});
export const DeleteAddressRequestSchema = z.object({
  address_id: z
    .number()
    .min(1, "Address id must be at least 1 characters long"),
});
export const SetDefaultAddressRequestSchema = z.object({
  address_id: z
    .number()
    .min(1, "Address id must be at least 1 characters long"),
});
