import mongoose from "mongoose";
import { z } from "zod";

const objectId = z.string().refine((value) => mongoose.isValidObjectId(value), {
  message: "Invalid ObjectId",
});

export const createRentalSchema = z.strictObject({
  customer: objectId,
  movie: objectId,
});

export const updateRentalSchema = z.strictObject({
  dateReturned: z.coerce.date().optional(),
});

export type CreateRentalInput = z.infer<typeof createRentalSchema>;
export type UpdateRentalInput = z.infer<typeof updateRentalSchema>;
