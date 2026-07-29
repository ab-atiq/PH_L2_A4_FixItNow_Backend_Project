// src/modules/booking/booking.route.ts
import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { bookingController } from "./booking.controller";

const router = Router();

router.post("/", auth(Role.CUSTOMER), bookingController.createBooking);
router.patch("/:id/status", auth(Role.TECHNICIAN), bookingController.updateBookingStatus);

export const bookingRoutes = router;    