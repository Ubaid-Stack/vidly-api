import type { Request, Response } from "express";

import type { LoginInput } from "../schema/authSchema.js";

import { loginUser } from "../services/authService.js";

const loginController = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
) => {
  const { email, password } = req.body;

  const user = await loginUser({
    email,
    password,
  });

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  return res.status(200).json({
    message: "Login successful",
    user,
  });
};

export default loginController;
