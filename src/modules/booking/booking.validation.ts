import { isOneOf, isValidDate, isValidUUID } from "../../utils/validators";

export type TCreateBookingBody = {
  technicianId: string;
  serviceId: string;
  scheduledDate: string;
};

export type TUpdateBookingStatusBody = {
  status: "ACCEPTED" | "DECLINED";
};

const createBookingValidation = (body: TCreateBookingBody): string[] | null => {
  const errors: string[] = [];

  if (!isValidUUID(body?.technicianId)) {
    errors.push("technicianId is required and must be a valid UUID");
  }
  if (!isValidUUID(body?.serviceId)) {
    errors.push("serviceId is required and must be a valid UUID");
  }
  if (!isValidDate(body?.scheduledDate)) {
    errors.push("scheduledDate is required and must be a valid date");
  }

  return errors.length ? errors : null;
};

const updateBookingStatusValidation = (
  body: TUpdateBookingStatusBody,
): string[] | null => {
  const errors: string[] = [];

  if (!isOneOf(body?.status, ["ACCEPTED", "DECLINED"] as const)) {
    errors.push("status must be either ACCEPTED or DECLINED");
  }

  return errors.length ? errors : null;
};

export const BookingValidation = {
  createBookingValidation,
  updateBookingStatusValidation,
};
