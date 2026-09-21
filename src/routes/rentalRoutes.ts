import { Router } from "express";
import {
  createRental,
  deleteRental,
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
import authorize from "../middlewares/authorizeMiddleware.js";

const router = Router();

router.get("/", getRentals);

router.get("/:id", authorize("admin"), validateObjectId({ objectIdName: "Rental" }), getRentalById);

router.post("/",authorize("admin"), validate(createRentalSchema), createRental);

router.put(
  "/:id",
  authorize("admin"),
  validateObjectId({ objectIdName: "Rental" }),
  validate(updateRentalSchema),
  updateRental,
);

router.delete(
  "/:id",
  authorize("admin"),
  validateObjectId({ objectIdName: "Rental" }),
  deleteRental,
);

export default router;
