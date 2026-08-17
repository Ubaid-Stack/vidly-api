import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

export const validateObjectId =
  ({
    objectIdName,
    paramName = "id",
  }: {
    objectIdName: string;
    paramName?: string;
  }) =>
  (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[paramName];

    if (!value || !mongoose.isValidObjectId(value)) {
      return res.status(400).json({
        message: `Invalid ${objectIdName} ID.`,
      });
    }

    next();
  };
