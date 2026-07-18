import { z } from "zod";

export const categoryInputSchema = z.strictObject({
    name: z.string().trim().toLowerCase().min(2),
    description: z.string().trim().optional(),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

/* This is the Zod schema for categories.
It validates incoming category data before the controller runs. */