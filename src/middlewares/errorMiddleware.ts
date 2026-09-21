import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";

export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // If Express already started sending the response,
  // let Express handle the error.
  if (res.headersSent) {
    return next(error);
  }

  // Zod validation error
  if (error instanceof ZodError) {
    logger.warn(
      {
        issues: error.issues,
        method: req.method,
        url: req.originalUrl,
      },
      "Request validation failed",
    );

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
    logger.warn(
      {
        errors: Object.keys(error.errors),
        method: req.method,
        url: req.originalUrl,
      },
      "Database validation failed",
    );

    return res.status(400).json({
      message: "Database validation failed.",
      errors: Object.entries(error.errors).map(([field, err]) => ({
        field,
        message: err.message,
      })),
    });
  }

  // Mongoose cast error
  if (error instanceof mongoose.Error.CastError) {
    logger.warn(
      {
        path: error.path,
        value: error.value,
        method: req.method,
        url: req.originalUrl,
      },
      "Invalid value supplied",
    );

    return res.status(400).json({
      message: "Invalid ID format.",
    });
  }

  // MongoDB duplicate key error
  if (
    error instanceof mongoose.mongo.MongoServerError &&
    error.code === 11000
  ) {
    logger.warn(
      {
        method: req.method,
        url: req.originalUrl,
      },
      "Duplicate resource",
    );

    return res.status(409).json({
      message: "A resource with this value already exists.",
    });
  }

  // Unexpected Error
  if (error instanceof Error) {
    logger.error(
      {
        err: error,
        method: req.method,
        url: req.originalUrl,
      },
      "Unhandled application error",
    );

    return res.status(500).json({
      message: "Internal server error.",
    });
  }

  // Completely unknown thrown value
  logger.error(
    {
      error,
      method: req.method,
      url: req.originalUrl,
    },
    "Unknown error thrown",
  );

  return res.status(500).json({
    message: "Internal server error.",
  });
};
