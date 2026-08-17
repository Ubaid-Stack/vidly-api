import mongoose from "mongoose";

export const genreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Genre = mongoose.model("Genre", genreSchema);

export default Genre;
