import type { Request, Response } from "express";

import type {
  CreateRentalInput,
  UpdateRentalInput,
} from "../schema/rentalSchema.js";
import * as rentalService from "../services/rentalService.js";

export const createRental = async (
  req: Request<{}, {}, CreateRentalInput>,
  res: Response,
) => {
  try {
    const rental = await rentalService.createRentalService(req.body);
    return res.status(201).json(rental);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Customer not found." ||
        error.message === "Movie not found.")
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    throw error;
  }
};

export const getRentals = async (_req: Request, res: Response) => {
  const rentals = await rentalService.getRentalsService();

  res.status(200).json(rentals);
};

export const getRentalById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const rental = await rentalService.getRentalByIdService(req.params.id);

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
  const rental = await rentalService.updateRentalService(
    req.params.id,
    req.body,
  );

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
  const rental = await rentalService.deleteRentalService(req.params.id);

  if (!rental) {
    return res.status(404).json({
      message: "Rental with the given ID was not found.",
    });
  }

  res.status(204).send();
};
