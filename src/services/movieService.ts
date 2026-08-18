import Movie from "../models/movieModel.js";
import type {
  CreateMovieInput,
  UpdateMovieInput,
} from "../schema/movieSchema.js";

export const createMovie = async (data: CreateMovieInput) => {
  return Movie.create(data);
};

export const getMovies = async () => {
  return Movie.find();
};

export const getMovieById = async (id: string) => {
  return Movie.findById(id);
};

export const updateMovie = async (id: string, data: UpdateMovieInput) => {
  return Movie.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteMovie = async (id: string) => {
  return Movie.findByIdAndDelete(id);
};
