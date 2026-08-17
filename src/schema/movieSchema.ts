import { z } from "zod";

const movieFields = {
  title: z
    .string()
    .trim()
    .min(3, "Movie title must be at least 3 characters.")
    .max(30, "Movie title must not exceed 30 characters."),
  genre: z.strictObject({
    name: z
      .string()
      .trim()
      .min(3, "Genre name must be at least 3 characters.")
      .max(30, "Genre name must not exceed 30 characters."),
  }),
  numberInStock: z
    .number()
    .min(0, "Number in stock must be at least 0.")
    .max(1000, "Number in stock must not exceed 1000."),
  dailyRentalRate: z
    .number()
    .min(0, "Daily rental rate must be at least 0.")
    .max(1000, "Daily rental rate must not exceed 1000."),
};

export const createMovieSchema = z.strictObject({
  title: movieFields.title,
  genre: movieFields.genre,
  numberInStock: movieFields.numberInStock,
  dailyRentalRate: movieFields.dailyRentalRate,
});

export const updateMovieSchema = z
  .strictObject({
    title: movieFields.title.optional(),
    genre: movieFields.genre.optional(),
    numberInStock: movieFields.numberInStock.optional(),
    dailyRentalRate: movieFields.dailyRentalRate.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>;
