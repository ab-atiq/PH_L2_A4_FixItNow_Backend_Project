import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { CategoryController } from "./category.controller";

const router = Router();

router.get("/", CategoryController.getCategories);
router.post("/", auth(Role.ADMIN), CategoryController.createCategory);

export const categoryRoutes = router;
