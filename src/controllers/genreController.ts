import type { Request, Response } from "express";
import Genre from "../models/genreModel.js";
import type {
  CreateGenreInput,
  UpdateGenreInput,
} from "../schema/genreSchema.js";
import * as genreService from "../services/genreService.js";

export const createGenre = async (
  req: Request<
    {}, // 1st {} is for params
    {}, // 2nd {} is for query
    CreateGenreInput /*Tells TS : The request body must have the CreateGenreInput shape.*/
  >,
  res: Response,
) => {
  const genre = await genreService.createGnreService(req.body);

  res.status(201).json(genre);
};

export const getGenres = async (_req: Request, res: Response) => {
  const genres = await genreService.getGenresService();

  res.status(200).json(genres);
};

export const getGenreById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const genre = await genreService.getGenreByIdService(req.params.id);

  if (!genre) {
    return res.status(404).json({
      message: "Genre with the given ID was not found.",
    });
  }

  res.status(200).json(genre);
};

export const updateGenre = async (
  req: Request<{ id: string }, {}, UpdateGenreInput>,
  res: Response,
) => {
  const genre = await genreService.updateGenreService(req.params.id, req.body);

  if (!genre) {
    return res.status(404).json({
      message: "Genre with the given ID was not found.",
    });
  }

  res.status(200).json(genre);
};

export const deleteGenre = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const genre = await genreService.deleteGenreService(req.params.id);

  if (!genre) {
    return res.status(404).json({
      message: "Genre with the given ID was not found.",
    });
  }

  res.status(204).send();
};
