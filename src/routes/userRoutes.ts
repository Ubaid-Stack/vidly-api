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

const router = Router();

router.post("/", authorize("admin"), validate(createUserSchema), createUser);

router.get("/", authorize("user"), getUsers);

router.get(
  "/:id",
  authorize("user"),
  validateObjectId({ objectIdName: "User" }),
  getUserById,
);

router.put(
  "/:id",
  authorize("admin"),
  validateObjectId({ objectIdName: "User" }),
  validate(updateUserSchema),
  updateUser,
);

router.delete(
  "/:id",
  authorize("admin"),
  validateObjectId({ objectIdName: "User" }),
  deleteUser,
);

export default router;
