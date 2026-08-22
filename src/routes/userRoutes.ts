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

const router = Router();

router.post("/", validate(createUserSchema), createUser);

router.get("/", getUsers);

router.get("/:id", validateObjectId({ objectIdName: "User" }), getUserById);

router.put(
  "/:id",
  validateObjectId({ objectIdName: "User" }),
  validate(updateUserSchema),
  updateUser,
);

router.delete("/:id", validateObjectId({ objectIdName: "User" }), deleteUser);

export default router;
