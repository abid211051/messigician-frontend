import { z } from "zod";

export const editTenantSchema = z.object({
  sub_mess_id: z.uuid({ error: "Invalid sub-mess" }),
  monthly_rent: z
    .number({ error: "Monthly rent must be a number" })
    .min(0, { error: "Monthly rent must be 0 or more" })
    .nullable()
    .optional(),

  total_due: z
    .number({ error: "Total due must be a number" })
    .nullable()
    .optional(),
});

export type EditTenantFormValues = z.infer<typeof editTenantSchema>;
