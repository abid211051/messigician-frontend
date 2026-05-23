import { z } from "zod";

const imageFileSchema = z
  .instanceof(File)
  .refine((f) => f.size <= 2 * 1024 * 1024, "Image must be under 2MB")
  .refine(
    (f) => ["image/jpeg", "image/png", "image/webp"].includes(f.type),
    "Only JPEG, PNG or WEBP allowed",
  );

export const createMessSchema = z.object({
  fname: z
    .string({ error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters"),
  file: imageFileSchema.optional(),
});

export type CreateMessFormValues = z.infer<typeof createMessSchema>;
