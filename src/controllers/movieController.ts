import type { Request, Response } from "express";
import type {
  CreateMovieInput,
  UpdateMovieInput,
} from "../schema/movieSchema.js";
import * as movieService from "../services/movieService.js";

export const createMovie = async (
  req: Request<{}, {}, CreateMovieInput>,
  res: Response,
) => {
  const movie = await movieService.createMovie(req.body);

  res.status(201).json(movie);
};

export const getMovies = async (_req: Request, res: Response) => {
  const movies = await movieService.getMovies();
  res.status(200).json(movies);
};

export const getMovieById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const movie = await movieService.getMovieById(req.params.id);
  if (!movie) {
    return res.status(404).json({ message: "Movie not found" });
  }
  res.status(200).json(movie);
};

export const updateMovie = async (
  req: Request<{ id: string }, {}, UpdateMovieInput>,
  res: Response,
) => {
  const movie = await movieService.updateMovie(req.params.id, req.body);

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
  const movie = await movieService.deleteMovie(req.params.id);
  if (!movie) {
    return res.status(404).json({
      message: "Movie with the given ID was not found.",
    });
  }
  res.status(204).send();
};
