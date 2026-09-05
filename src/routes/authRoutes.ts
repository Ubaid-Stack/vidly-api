import { Router } from "express";
import {
  loginController,
  refreshAccessToken,
  logoutController,
} from "../controllers/authController.js";
import { loginSchema } from "../schema/authSchema.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

router.post("/login", validate(loginSchema), loginController);

router.post("/refresh", refreshAccessToken);

router.post("/logout", logoutController);

export default router;
