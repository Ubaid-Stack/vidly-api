import { z } from "zod";

const customerFields = {
  name: z
    .string()
    .trim()
    .min(3, "Customer name must be at least 3 characters.")
    .max(30, "Customer name must not exceed 30 characters."),
  phone: z.string().trim().min(5).max(20),
  isGold: z.boolean().default(false),
};

export const createCustomerSchema = z.strictObject({
  name: customerFields.name,
  phone: customerFields.phone,
  isGold: customerFields.isGold,
});

export const updateCustomerSchema = z
  .strictObject({
    name: customerFields.name.optional(),
    phone: customerFields.phone.optional(),
    isGold: customerFields.isGold.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
