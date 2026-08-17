import type { Request, Response } from "express";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../schema/customerSchema.js";
import Customer from "../models/customerModel.js";

export const createCustomer = async (
  req: Request<{}, {}, CreateCustomerInput>,
  res: Response,
) => {
  const customer = await Customer.create(req.body);

  res.status(201).json(customer);
};

export const getCustomers = async (req: Request, res: Response) => {
  const customers = await Customer.find();

  res.status(200).json(customers);
};

export const getCustomerById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  res.status(200).json(customer);
};

export const updateCustomer = async (
  req: Request<{ id: string }, {}, UpdateCustomerInput>,
  res: Response,
) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!customer) {
    return res.status(404).json({
      message: "Customer with the given ID was not found.",
    });
  }

  res.status(200).json(customer);
};

export const deleteCustomer = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);

  if (!customer) {
    return res.status(404).json({
      message: "Customer with the given ID was not found.",
    });
  }

  res.status(204).send();
};
