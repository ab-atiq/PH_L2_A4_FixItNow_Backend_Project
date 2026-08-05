import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { TechnicianProfileController } from "./technician.controller";
import { TechnicianProfileValidation } from "./technician.validation";
import { bookingController } from "../booking/booking.controller";
import { BookingValidation } from "../booking/booking.validation";

const router = Router();

router.get("/", TechnicianProfileController.getTechnicians);
router.get(
  "/me",
  auth(Role.TECHNICIAN),
  TechnicianProfileController.getMyProfile,
);
router.put(
  "/availability",
  auth(Role.TECHNICIAN),
  validateRequest(TechnicianProfileValidation.validateAvailabilitySlots),
  TechnicianProfileController.updateAvailability,
);
router.post(
  "/profile",
  auth(Role.TECHNICIAN),
  validateRequest(TechnicianProfileValidation.createProfileValidation),
  TechnicianProfileController.createProfile,
);
router.get(
  "/bookings",
  auth(Role.TECHNICIAN),
  TechnicianProfileController.getBookings,
);
router.patch(
  "/bookings/:id",
  auth(Role.TECHNICIAN),
  validateRequest(BookingValidation.updateBookingStatusValidation),
  bookingController.updateBookingStatus,
);
router.get("/:id", TechnicianProfileController.getTechnicianById);

export const technicianProfileRoutes = router;
