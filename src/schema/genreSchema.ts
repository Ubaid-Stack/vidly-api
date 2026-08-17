import { z } from "zod";

const genreFields = {
  name: z
    .string()
    .trim()
    .min(3, "Genre name must be at least 3 characters.")
    .max(30, "Genre name must not exceed 30 characters."),
};

export const createGenreSchema = z.strictObject({ // Only the fields defined in this schema are allowed.
  name: genreFields.name,
});

export const updateGenreSchema = z
  .strictObject({
    name: genreFields.name.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { // After checking the normal rules, make sure the object has at least one field.
    message: "At least one field must be provided.",
  });

// TypeScript types generated from Zod
export type CreateGenreInput = z.infer<typeof createGenreSchema>;
export type UpdateGenreInput = z.infer<typeof updateGenreSchema>;