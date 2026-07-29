import { z } from "zod";

const createBookingValidation = z.object({
  body: z.object({
    technicianId: z.string({ required_error: "technicianId is required" }).uuid(),
    serviceId: z.string({ required_error: "serviceId is required" }).uuid(),
    scheduledDate: z.coerce.date({ required_error: "scheduledDate is required" }),
  }),
});

const updateBookingStatusValidation = z.object({
  body: z.object({
    status: z.enum(["ACCEPTED", "DECLINED"]),
  }),
});

export const BookingValidation = {
  createBookingValidation,
  updateBookingStatusValidation,
};
