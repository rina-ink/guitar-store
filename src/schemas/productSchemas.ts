import { z } from "zod";

export const productInputSchema = z.strictObject({
    name: z.string().trim().min(2),
    description: z.string().trim().min(1),
    brand: z.string().trim().min(1),
    category: z.string().trim().min(1),
    price: z.number().min(0),
    stock: z.number().int().min(0),   // must be a whole number, no decimals
    imageUrl: z.url().optional(),
});

export type ProductInput = z.infer<typeof productInputSchema>;


/* This is the Zod schema for products. 
Think of it as the gatekeeper for every incoming product request. 
Before the controller runs, Zod checks that the request body matches these rules. */