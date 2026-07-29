import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { TechnicianProfileController } from "./technician.controller";
import { TechnicianProfileValidation } from "./technician.validation";

const router = Router();

router.get(
  "/me",
  auth(Role.TECHNICIAN),
  TechnicianProfileController.getMyProfile,
);
router.post(
  "/profile",
  auth(Role.TECHNICIAN),
  validateRequest(TechnicianProfileValidation.createProfileValidation),
  TechnicianProfileController.createProfile,
);

export const technicianProfileRoutes = router;
