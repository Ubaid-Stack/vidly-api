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

const router = express.Router();

router.post("/", validate(createCustomerSchema), createCustomer);

router.get("/", getCustomers);

router.get(
  "/:id",
  validateObjectId({ objectIdName: "Customer" }),
  getCustomerById,
);

router.patch(
  "/:id",
  validateObjectId({ objectIdName: "Customer" }),
  validate(updateCustomerSchema),
  updateCustomer,
);

router.delete(
  "/:id",
  validateObjectId({ objectIdName: "Customer" }),
  deleteCustomer,
);

export default router;
