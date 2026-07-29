import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { ReviewController } from "./review.controller";

const router = Router();

router.post("/", auth(Role.CUSTOMER), ReviewController.createReview);

export const reviewRoutes = router;
