import httpStatus from "http-status";
import { BookingStatus, Role } from "../../../generated/prisma/enums";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";

export type TCreateBookingPayload = {
  technicianId: string;
  serviceId: string;
  scheduledDate: string | Date;
};

export type TUpdateBookingStatusPayload = {
  status: Extract<BookingStatus, "ACCEPTED" | "DECLINED">;
};

const createBooking = async (customerId: string, payload: TCreateBookingPayload) => {
  const { technicianId, serviceId, scheduledDate } = payload;

  const technician = await prisma.user.findUnique({ where: { id: technicianId } });

  if (!technician || technician.role !== Role.TECHNICIAN) {
    throw new AppError(httpStatus.NOT_FOUND, "Technician not found");
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });

  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found");
  }

  const booking = await prisma.booking.create({
    data: {
      customerId,
      technicianId,
      serviceId,
      scheduledDate: new Date(scheduledDate),
      status: BookingStatus.REQUESTED,
    },
  });

  return booking;
};

const getMyBookings = async (userId: string, role: Role) => {
  const where = role === Role.TECHNICIAN ? { technicianId: userId } : { customerId: userId };

  return prisma.booking.findMany({
    where,
    include: { service: true, payment: true },
    orderBy: { createdAt: "desc" },
  });
};

const getBookingById = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true, payment: true },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  return booking;
};

const updateBookingStatus = async (
  bookingId: string,
  technicianId: string,
  payload: TUpdateBookingStatusPayload
) => {
  const { status } = payload;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  if (booking.technicianId !== technicianId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to update this booking"
    );
  }

  if (booking.status !== BookingStatus.REQUESTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Booking has already been ${booking.status.toLowerCase()}`
    );
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });
};

export const bookingService = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
};
