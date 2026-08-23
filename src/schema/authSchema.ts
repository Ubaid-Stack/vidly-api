import { z } from "zod";

const loginFields = {
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1, { message: "Password is required." }),
};

export const loginSchema = z.strictObject({
  email: loginFields.email,
  password: loginFields.password,
});

export type LoginInput = z.infer<typeof loginSchema>;
