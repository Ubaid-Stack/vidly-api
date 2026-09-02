import type { NextFunction, Request, Response } from "express";

import { verifyAccessToken } from "../utils/jwt.js";

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
    req.userId = payload.userId as string;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired access token",
    });
  }
};

export default authenticate;
