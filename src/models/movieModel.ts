import { Schema, model } from "mongoose";
import { genreSchema } from "./genreModel.js";

const movieSchema = new Schema(
  {
    title: { type: String, required: true, minlength: 3, maxlength: 30 },
    genre: genreSchema, 
    numberInStock: { type: Number, required: true, min: 0, max: 1000 },
    dailyRentalRate: { type: Number, required: true, min: 0, max: 1000 },
  },
  { timestamps: true },
);

const Movie = model("Movie", movieSchema);

export default Movie;
