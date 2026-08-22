import {
  type CreateUserInput,
  type UpdateUserInput,
} from "../schema/userSchema.js";
import User from "../models/userModel.js";

export const createUserService = async (data: CreateUserInput) => {
  return User.create(data);
};

export const getUsersService = async () => {
  return User.find();
};

export const getUserByIdService = async (id: string) => {
  return User.findById(id);
};

export const updateUserService = async (id: string, data: UpdateUserInput) => {
  return User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteUserService = async (id: string) => {
  return User.findByIdAndDelete(id);
};
