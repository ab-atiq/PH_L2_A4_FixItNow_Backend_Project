import { isInRange, isValidUUID } from "../../utils/validators";

export type TCreateReviewBody = {
  bookingId: string;
  rating: number;
  comment?: string;
};

const validateCreateReview = (body: TCreateReviewBody): string[] | null => {
  const errors: string[] = [];

  if (!isValidUUID(body?.bookingId)) {
    errors.push("bookingId is required and must be a valid UUID");
  }
  if (!isInRange(body?.rating, 1, 5)) {
    errors.push("rating is required and must be a number between 1 and 5");
  }
  if (body?.comment !== undefined && typeof body.comment !== "string") {
    errors.push("comment must be a string");
  }

  return errors.length ? errors : null;
};

export const ReviewValidation = {
  validateCreateReview,
};
