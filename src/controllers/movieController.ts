import type { Request, Response } from "express";
import type { CreateMovieInput } from "../schema/movieSchema.js";
import Movie from "../models/movieModel.js";

export const createMovie = async (
  req: Request<{}, {}, CreateMovieInput>,
  res: Response,
) => {
  const movie = await Movie.create(req.body);

  res.status(201).json(movie);
};

export const getMovies = async (req: Request, res: Response) => {
  const movies = await Movie.find();
  res.status(200).json(movies);
};

export const getMovieById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) {
    return res.status(404).json({ message: "Movie not found" });
  }
  res.status(200).json(movie);
};

export const updateMovie = async (
  req: Request<{ id: string }, {}, CreateMovieInput>,
  res: Response,
) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!movie) {
    return res.status(404).json({
      message: "Movie with the given ID was not found.",
    });
  }

  res.status(200).json(movie);
};

export const deleteMovie = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) {
    return res.status(404).json({
      message: "Movie with the given ID was not found.",
    });
  }
  res.status(204).send();
};
