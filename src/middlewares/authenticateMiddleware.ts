import type { NextFunction, Request, Response } from "express";

import { verifyAccessToken } from "../utils/jwt.js";
import User from "../models/userModel.js";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  try {
    const payload = await verifyAccessToken(token);

    if (typeof payload.userId !== "string") {
      return res.status(401).json({
        message: "Invalid or expired access token",
      });
    }

    const user = await User.findById(payload.userId).select("role");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = {
      userId: payload.userId,
      role: user.role,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired access token",
    });
  }
};

export default authenticate;
