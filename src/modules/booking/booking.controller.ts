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

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  console.log("User:", req.user);
  const bookings = await bookingService.getMyBookings(
    req.user!.id,
    req.user!.role,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Bookings retrieved successfully",
    data: bookings,
  });
});

const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const booking = await bookingService.getBookingById(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking retrieved successfully",
    data: booking,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const technicianId = req.user!.id;
  const { id: bookingId } = req.params;

  const booking = await bookingService.updateBookingStatus(
    bookingId as string,
    technicianId,
    req.body,
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
  getMyBookings,
  getBookingById,
  updateBookingStatus,
};
