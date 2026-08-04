import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { CategoryController } from "./category.controller";
import { CategoryValidation } from "./category.validation";

const router = Router();

router.get("/", CategoryController.getCategories);

router.post(
  "/",
  auth(Role.ADMIN),
  validateRequest(CategoryValidation.validateCreateCategory),
  CategoryController.createCategory
);

export const categoryRoutes = router;
