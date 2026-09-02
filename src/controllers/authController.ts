import type { Request, Response } from "express";
import type { LoginInput } from "../schema/authSchema.js";
import loginUser from "../services/authService.js";
import { env } from "../config/env.js";

const loginController = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
) => {
  const { email, password } = req.body;

  const result = await loginUser({
    email,
    password,
  });
  if (!result || !result.accessToken) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const { accessToken } = result;

  if (!accessToken) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  return res.status(200).json({
    message: "Login successful",
  });
};

export default loginController;
