import { Router } from "express";
import {
  createMovie,
  deleteMovie,
  getMovieById,
  getMovies,
  updateMovie,
} from "../controllers/movieController.js";
import { validateObjectId } from "../middlewares/validateObjectId.js";
import { validate } from "../middlewares/validate.js";
import { createMovieSchema, updateMovieSchema } from "../schema/movieSchema.js";
import authenticate from "../middlewares/authenticateMiddleware.js";
import authorize from "../middlewares/authorizeMiddleware.js";

const router = Router();

router.get("/", getMovies);
router.get("/:id", validateObjectId({ objectIdName: "Movie" }), getMovieById);
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createMovieSchema),
  createMovie,
);
router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validateObjectId({ objectIdName: "Movie" }),
  validate(updateMovieSchema),
  updateMovie,
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validateObjectId({ objectIdName: "Movie" }),
  deleteMovie,
);

export default router;
