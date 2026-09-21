import express from "express";
import {
  createGenre,
  getGenres,
  getGenreById,
  updateGenre,
  deleteGenre,
} from "../controllers/genreController.js";
import { validate } from "../middlewares/validate.js";
import { validateObjectId } from "../middlewares/validateObjectId.js";
import { createGenreSchema, updateGenreSchema } from "../schema/genreSchema.js";
import authenticate from "../middlewares/authenticateMiddleware.js";
import authorize from "../middlewares/authorizeMiddleware.js";

const router = express.Router();

// POST /api/genres
router.post("/", authenticate, authorize("admin"), validate(createGenreSchema), createGenre);

// GET /api/genres
router.get("/", getGenres);

// GET /api/genres/:id
router.get("/:id", authenticate, authorize("admin"), validateObjectId({ objectIdName: "Genre" }), getGenreById);

// PATCH /api/genres/:id
router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validateObjectId({ objectIdName: "Genre" }),
  validate(updateGenreSchema),
  updateGenre,
);

// DELETE /api/genres/:id
router.delete("/:id", authenticate, authorize("admin"), validateObjectId({ objectIdName: "Genre" }), deleteGenre);

export default router;
