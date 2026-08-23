import { Router } from "express";
import loginController from "../controllers/authController.js";
import { loginSchema } from "../schema/authSchema.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

router.post("/login", validate(loginSchema), loginController);

export default router;
