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

const router = express.Router();

router.post(
  "/",
  authorize("admin"),
  validate(createCustomerSchema),
  createCustomer,
);

router.get("/", getCustomers);

router.get(
  "/:id",
  authorize("admin"),
  validateObjectId({ objectIdName: "Customer" }),
  getCustomerById,
);

router.patch(
  "/:id",
  authorize("admin"),
  validateObjectId({ objectIdName: "Customer" }),
  validate(updateCustomerSchema),
  updateCustomer,
);

router.delete(
  "/:id",
  authorize("admin"),
  validateObjectId({ objectIdName: "Customer" }),
  deleteCustomer,
);

export default router;
