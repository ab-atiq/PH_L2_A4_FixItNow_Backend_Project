import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { ServiceController } from "./service.controller";
import { ServiceValidation } from "./service.validation";

const router = Router();

router.get("/", ServiceController.getServices);
router.post(
  "/",
  auth(Role.TECHNICIAN),
  validateRequest(ServiceValidation.validateCreateService),
  ServiceController.createService,
);

export const serviceRoutes = router;
