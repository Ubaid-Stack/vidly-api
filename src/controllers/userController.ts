import type { Request, Response } from "express";

import type {
  CreateUserInput,
  UpdateUserInput,
} from "../schema/userSchema.js";

import {
  createUserService,
  deleteUserService,
  getUserByEmailService,
  getUserByIdService,
  getUsersService,
  updateUserService,
} from "../services/userService.js";

export const createUser = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response,
) => {
  const { username, email, password } = req.body;

  const existingUser = await getUserByEmailService(email);

  if (existingUser) {
    return res.status(409).json({
      message: "User with this email already exists",
    });
  }

  const newUser = await createUserService({
    username,
    email,
    password,
  });

  return res.status(201).json({
    id: newUser._id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  });
};

export const getUsers = async (
  _req: Request,
  res: Response,
) => {
  const users = await getUsersService();

  return res.status(200).json(users);
};

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const user = await getUserByIdService(req.params.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json(user);
};

export const updateUser = async (
  req: Request<{ id: string }, {}, UpdateUserInput>,
  res: Response,
) => {
  const user = await updateUserService(
    req.params.id,
    req.body,
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json(user);
};

export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const user = await deleteUserService(req.params.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(204).send();
};