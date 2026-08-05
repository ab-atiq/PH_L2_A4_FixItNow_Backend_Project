import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { AdminController } from "./admin.controller";
import { AdminValidation } from "./admin.validation";
import { CategoryValidation } from "../category/category.validation";

const router = Router();

router.get("/users", auth(Role.ADMIN), AdminController.getUsers);
router.patch(
  "/users/:id",
  auth(Role.ADMIN),
  validateRequest(AdminValidation.validateUpdateUserStatus),
  AdminController.updateUserStatus,
);
router.get("/bookings", auth(Role.ADMIN), AdminController.getBookings);
router.get("/categories", auth(Role.ADMIN), AdminController.getCategories);
router.post(
  "/categories",
  auth(Role.ADMIN),
  validateRequest(CategoryValidation.validateCreateCategory),
  AdminController.createCategory,
);

export const adminRoutes = router;
