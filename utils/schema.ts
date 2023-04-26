import * as z from "zod";

export const formSchema = z.object({
  recs: z.number().gte(1).lte(20000),
});
export type FormSchema = z.infer<typeof formSchema>;
