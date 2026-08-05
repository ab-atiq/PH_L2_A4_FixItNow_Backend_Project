import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { bookingController } from "./booking.controller";
import { BookingValidation } from "./booking.validation";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(BookingValidation.createBookingValidation),
  bookingController.createBooking
);

router.get("/", auth(Role.CUSTOMER, Role.TECHNICIAN), bookingController.getMyBookings);

router.get("/:id", auth(), bookingController.getBookingById);

router.patch(
  "/:id",
  auth(Role.TECHNICIAN),
  validateRequest(BookingValidation.updateBookingStatusValidation),
  bookingController.updateBookingStatus
);

export const bookingRoutes = router;
