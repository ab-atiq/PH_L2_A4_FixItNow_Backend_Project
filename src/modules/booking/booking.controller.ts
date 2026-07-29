// src/modules/booking/booking.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { bookingService } from "./booking.service";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user!.id;

  const booking = await bookingService.createBooking(customerId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Booking requested successfully",
    data: booking,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const technicianId = req.user!.id;
  const { id: bookingId } = req.params;

  const booking = await bookingService.updateBookingStatus(
    bookingId,
    technicianId,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Booking ${booking.status.toLowerCase()} successfully`,
    data: booking,
  });
});

export const bookingController = {
  createBooking,
  updateBookingStatus,
};