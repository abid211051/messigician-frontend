import { z } from "zod";

export const createSubMessSchema = z.object({
  fname: z
    .string()
    .min(1, "Name is required")
    .max(30, "Name must be at most 30 characters"),

  total_rent: z
    .number({ error: "Must be a valid number" })
    .nonnegative("Must be 0 or more")
    .optional(),

  no_of_seats: z
    .number({ error: "Must be a valid number" })
    .int("Must be a whole number")
    .positive("Must be at least 1")
    .optional(),
});

export type CreateSubMessFormValues = z.infer<typeof createSubMessSchema>;
