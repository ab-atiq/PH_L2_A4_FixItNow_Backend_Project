import { type Request, type Response } from "express";
import httpStatus from "http-status";
import { BookingStatus } from "../../../generated/prisma/enums";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const { bookingId, rating, comment } = req.body;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking || booking.customerId !== customerId) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can only review a completed job",
    );
  }

  const review = await prisma.review.create({
    data: { customerId, technicianId: booking.technicianId, rating, comment },
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Review submitted successfully",
    data: review,
  });
});

export const ReviewController = { createReview };
