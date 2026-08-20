import Genre from "../models/genreModel.js";
import type {
  CreateGenreInput,
  UpdateGenreInput,
} from "../schema/genreSchema.js";

export const createGnreService = async (data: CreateGenreInput) => {
  return Genre.create(data);
};

export const getGenresService = async () => {
  return Genre.find();
};

export const getGenreByIdService = async (id: string) => {
  return Genre.findById(id);
};

export const updateGenreService = async (
  id: string,
  data: UpdateGenreInput,
) => {
  return Genre.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteGenreService = async (id: string) => {
  return Genre.findByIdAndDelete(id);
};
