import { Router } from "express";
import {
  createRental,
  getRentalById,
  getRentals,
  updateRental,
} from "../controllers/rentalController.js";
import { validateObjectId } from "../middlewares/validateObjectId.js";
import { validate } from "../middlewares/validate.js";
import {
  createRentalSchema,
  updateRentalSchema,
} from "../schema/rentalSchema.js";

const router = Router();

router.get("/", getRentals);

router.get("/:id", validateObjectId({ objectIdName: "Rental" }), getRentalById);

router.post("/", validate(createRentalSchema), createRental);

router.put(
  "/:id",
  validateObjectId({ objectIdName: "Rental" }),
  validate(updateRentalSchema),
  updateRental,
);

router.delete(
  "/:id",
  validateObjectId({ objectIdName: "Rental" }),
  updateRental,
);

export default router;
