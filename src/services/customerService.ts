import Customer from "../models/customerModel.js";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../schema/customerSchema.js";

export const createCustomer = async (data: CreateCustomerInput) => {
  return Customer.create(data);
};

export const getCustomers = async () => {
  return Customer.find();
};

export const getCustomerById = async (id: string) => {
  return Customer.findById(id);
};

export const updateCustomer = async (id: string, data: UpdateCustomerInput) => {
  return Customer.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteCustomer = async (id: string) => {
  return Customer.findByIdAndDelete(id);
};
