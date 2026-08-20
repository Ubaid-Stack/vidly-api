import Customer from "../models/customerModel.js";
import Movie from "../models/movieModel.js";
import Rental from "../models/rentalModel.js";
import type {
  CreateRentalInput,
  UpdateRentalInput,
} from "../schema/rentalSchema.js";

export const createRentalService = async ({
  customer,
  movie,
}: CreateRentalInput) => {
  const customerExists = await Customer.findById(customer);
  if (!customerExists) throw new Error("Customer not found.");

  const movieExists = await Movie.findById(movie);
  if (!movieExists) throw new Error("Movie not found.");

  return Rental.create({
    customer,
    movie,
    rentalFee: movieExists.dailyRentalRate,
  });
};

export const getRentalsService = async () => {
  return Rental.find();
};

export const getRentalByIdService = async (rentalId: string) => {
  return Rental.findById(rentalId);
};

export const updateRentalService = async (
  rentalId: string,
  updateData: UpdateRentalInput,
) => {
  return Rental.findByIdAndUpdate(rentalId, updateData, {
    new: true,
    runValidators: true,
  });
};

export const deleteRentalService = async (rentalId: string) => {
  return Rental.findByIdAndDelete(rentalId);
};
