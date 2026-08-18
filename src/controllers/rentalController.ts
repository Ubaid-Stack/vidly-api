import type { Request, Response } from "express";

import type {
  CreateRentalInput,
  UpdateRentalInput,
} from "../schema/rentalSchema.js";

import Rental from "../models/rentalModel.js";
import Customer from "../models/customerModel.js";
import Movie from "../models/movieModel.js";

export const createRental = async (
  req: Request<{}, {}, CreateRentalInput>,
  res: Response,
) => {
  const { customer, movie } = req.body;

  const customerExists = await Customer.findById(customer);

  if (!customerExists) {
    return res.status(404).json({
      message: "Customer not found.",
    });
  }

  const movieExists = await Movie.findById(movie);

  if (!movieExists) {
    return res.status(404).json({
      message: "Movie not found.",
    });
  }

  const rental = await Rental.create({
    customer,
    movie,
    rentalFee: movieExists.dailyRentalRate,
  });

  res.status(201).json(rental);
};

export const getRentals = async (_req: Request, res: Response) => {
  const rentals = await Rental.find();

  res.status(200).json(rentals);
};

export const getRentalById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const rental = await Rental.findById(req.params.id);

  if (!rental) {
    return res.status(404).json({
      message: "Rental not found.",
    });
  }

  res.status(200).json(rental);
};

export const updateRental = async (
  req: Request<{ id: string }, {}, UpdateRentalInput>,
  res: Response,
) => {
  const rental = await Rental.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!rental) {
    return res.status(404).json({
      message: "Rental with the given ID was not found.",
    });
  }

  res.status(200).json(rental);
};

export const deleteRental = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const rental = await Rental.findByIdAndDelete(req.params.id);

  if (!rental) {
    return res.status(404).json({
      message: "Rental with the given ID was not found.",
    });
  }

  res.status(204).send();
};
