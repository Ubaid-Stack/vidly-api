import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { createUserSchema, updateUserSchema } from "../schema/userSchema.js";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "../controllers/userController.js";
import { validateObjectId } from "../middlewares/validateObjectId.js";
import authorize from "../middlewares/authorizeMiddleware.js";
import authenticate from "../middlewares/authenticateMiddleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createUserSchema),
  createUser,
);

router.get("/", authenticate, authorize("user"), getUsers);

router.get(
  "/:id",
  authenticate,
  authorize("user"),
  validateObjectId({ objectIdName: "User" }),
  getUserById,
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validateObjectId({ objectIdName: "User" }),
  validate(updateUserSchema),
  updateUser,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validateObjectId({ objectIdName: "User" }),
  deleteUser,
);

export default router;
