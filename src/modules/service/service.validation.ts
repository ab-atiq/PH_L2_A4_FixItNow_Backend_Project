import { isNonEmptyString, isPositiveNumber, isValidUUID } from "../../utils/validators";

export type TCreateServiceBody = {
  name: string;
  description?: string;
  categoryId: string;
  basePrice: number;
};

const validateCreateService = (body: TCreateServiceBody): string[] | null => {
  const errors: string[] = [];

  if (!isNonEmptyString(body?.name, 2)) {
    errors.push("name is required and must be at least 2 characters");
  }
  if (body?.description !== undefined && typeof body.description !== "string") {
    errors.push("description must be a string");
  }
  if (!isValidUUID(body?.categoryId)) {
    errors.push("categoryId is required and must be a valid UUID");
  }
  if (!isPositiveNumber(body?.basePrice)) {
    errors.push("basePrice is required and must be a positive number");
  }

  return errors.length ? errors : null;
};

export const ServiceValidation = {
  validateCreateService,
};
