import express from "express";
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from "../controllers/customerController.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../schema/customerSchema.js";
import { validate } from "../middlewares/validate.js";
import { validateObjectId } from "../middlewares/validateObjectId.js";
import authorize from "../middlewares/authorizeMiddleware.js";
import authenticate from "../middlewares/authenticateMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createCustomerSchema),
  createCustomer,
);

router.get("/", getCustomers);

router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  validateObjectId({ objectIdName: "Customer" }),
  getCustomerById,
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validateObjectId({ objectIdName: "Customer" }),
  validate(updateCustomerSchema),
  updateCustomer,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validateObjectId({ objectIdName: "Customer" }),
  deleteCustomer,
);

export default router;
