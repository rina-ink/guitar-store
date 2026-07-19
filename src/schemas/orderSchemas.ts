import { z } from "zod";

const orderItemSchema = z.strictObject({
    product: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),

    quantity: z
        .number()
        .int()
        .min(1, "Quantity must be at least 1"),
});

const customerSchema = z.strictObject({
    name: z
        .string()
        .trim()
        .min(2, "Customer name must be at least 2 characters"),

    email: z
        .email("Invalid email address")
        .trim()
        .toLowerCase(),

    shippingAddress: z.strictObject({
        street: z
            .string()
            .trim()
            .min(1, "Street is required"),

        city: z
            .string()
            .trim()
            .min(1, "City is required"),

        postalCode: z
            .string()
            .trim()
            .min(1, "Postal code is required"),

        country: z
            .string()
            .trim()
            .min(1, "Country is required"),
    }),
});

export const orderInputSchema = z.strictObject({
    customer: customerSchema,

    items: z
        .array(orderItemSchema)
        .min(1, "An order must contain at least one item"),
});

export type OrderInput = z.infer<typeof orderInputSchema>;