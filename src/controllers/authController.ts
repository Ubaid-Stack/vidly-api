import type { Request, Response } from "express";
import type { LoginInput } from "../schema/authSchema.js";
import loginUser from "../services/authService.js";
import { env } from "../config/env.js";
import refreshTokenService from "../services/refreshTokenService.js";

export const loginController = async (
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

  const { accessToken, refreshToken } = result;

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

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.status(200).json({
    message: "Login successful",
  });
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token required",
    });
  }

  try {
    const result = await refreshTokenService(refreshToken);

    const { accessToken, refreshToken: newRefreshToken } = result;

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      message: "Access token refreshed",
    });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
};
