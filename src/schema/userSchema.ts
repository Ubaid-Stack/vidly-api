import { z } from "zod";
const userFields = {
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6).max(100),
};

export const createUserSchema = z.strictObject({
  username: userFields.username,
  email: userFields.email,
  password: userFields.password,
});

export const updateUserSchema = z
  .strictObject({
    username: userFields.username.optional(),
    email: userFields.email.optional(),
    password: userFields.password.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
