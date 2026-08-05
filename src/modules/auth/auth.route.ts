import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import { Role } from "../../../generated/prisma/client";

const router = Router();

router.post(
  "/register",
  validateRequest(AuthValidation.validateRegister),
  AuthController.register,
);

router.post(
  "/login",
  validateRequest(AuthValidation.validateLogin),
  AuthController.login,
);

router.post(
  "/refresh-token",
  auth(Role.TECHNICIAN, Role.CUSTOMER, Role.ADMIN),
  AuthController.refreshToken,
);

router.get("/me", auth(), AuthController.getMe);

export const authRoutes = router;
