import type { CreateUserInput, UpdateUserInput } from "../schema/userSchema.js";
import {
  createUserService,
  deleteUserService,
  getUserByIdService,
  getUsersService,
  updateUserService,
  getUserByEmailService,
} from "../services/userService.js";
import type { Request, Response } from "express";

export const createUser = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response,
) => {
  const { username, email, password } = req.body;

  const existingUser = await getUserByEmailService(email);

  if (existingUser) {
    return res.status(400).json({
      message: "User with this email already exists",
    });
  }
  const newUser = await createUserService({ username, email, password });

  res.status(201).json(newUser);
};

export const getUsers = async (_req: Request, res: Response) => {
  const users = await getUsersService();
  res.status(200).json(users);
};

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const user = await getUserByIdService(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json(user);
};
export const updateUser = async (
  req: Request<{ id: string }, {}, UpdateUserInput>,
  res: Response,
) => {
  const user = await updateUserService(req.params.id, req.body);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json(user);
};
export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const user = await deleteUserService(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(204).send();
};
