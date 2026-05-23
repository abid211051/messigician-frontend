import { z } from "zod";

export const joinMessSchema = z.object({
  mess_id: z.uuid({ error: "Invalid Mess ID format" }),
  sub_mess_id: z.uuid({ error: "Invalid Sub-mess ID format" }),
});

export type JoinMessFormValues = z.infer<typeof joinMessSchema>;
