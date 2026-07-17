import { z } from "zod";

export const userInputSchema = z.strictObject({
    name: z.string().trim().min(2),
    email: z.email().trim(),
    password: z.string().min(8),
});

export type UserInput = z.infer<typeof userInputSchema>;