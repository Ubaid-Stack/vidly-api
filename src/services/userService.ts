import type { CreateUserInput, UpdateUserInput } from "../schema/userSchema.js";

import User from "../models/userModel.js";
import { hashPassword } from "../utils/password.js";

export const createUserService = async (data: CreateUserInput) => {
  const passwordHash = await hashPassword(data.password);

  return User.create({
    username: data.username,
    email: data.email,
    passwordHash,
  });
};

export const updateUserService = async (id: string, data: UpdateUserInput) => {
  const updateData: {
    username?: string;
    email?: string;
    passwordHash?: string;
  } = {};

  if (data.username !== undefined) {
    updateData.username = data.username;
  }

  if (data.email !== undefined) {
    updateData.email = data.email;
  }

  if (data.password !== undefined) {
    updateData.passwordHash = await hashPassword(data.password);
  }

  return User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

export const getUsersService = async () => {
  return User.find();
};

export const getUserByIdService = async (id: string) => {
  return User.findById(id);
};

export const deleteUserService = async (id: string) => {
  return User.findByIdAndDelete(id);
};

export const getUserByEmailService = async (email: string) => {
  return User.findOne({ email });
};

export const getUserByEmailWithPasswordService = async (email: string) => {
  return User.findOne({ email }).select("+passwordHash");
};
