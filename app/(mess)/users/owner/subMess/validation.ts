import { z } from "zod";
export const createSubMessSchema = z.object({
  fname: z
    .string()
    .min(1, "Name is required")
    .max(30, "Name must be at most 30 characters"),
  total_rent: z
    .number({ error: "Must be a valid number" })
    .nonnegative("Must be a non-negative number")
    .optional(),
  no_of_seats: z
    .number({ error: "Must be a valid number" })
    .int("Must be a whole number")
    .positive("Must be a positive integer")
    .optional(),
});

export type CreateSubMessFormValues = z.infer<typeof createSubMessSchema>;
