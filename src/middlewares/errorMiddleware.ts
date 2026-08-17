import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Zod validation error
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed.",
      errors: error.issues.map((issue) => ({
        field: issue.path.length > 0 ? issue.path.join(".") : "root",
        message: issue.message,
      })),
    });
  }

  // Mongoose validation error
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: "Database validation failed.",
      errors: Object.entries(error.errors).map(([field, err]) => ({
        field,
        message: err.message,
      })),
    });
  }

  // Invalid MongoDB ObjectId
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      message: "Invalid ID format.",
    });
  }

  // MongoDB duplicate key error
  if (
    error instanceof mongoose.mongo.MongoServerError &&
    error.code === 11000
  ) {
    return res.status(409).json({
      message: "A resource with this value already exists.",
    });
  }

  // Normal JavaScript Error
  if (error instanceof Error) {
    return res.status(500).json({
      message: error.message,
    });
  }

  // Unknown error
  return res.status(500).json({
    message: "An unexpected error occurred.",
  });
};
