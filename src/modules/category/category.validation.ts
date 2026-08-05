import { isNonEmptyString } from "../../utils/validators";

export type TCreateCategoryBody = {
  categoryName: string;
  description?: string;
};

const validateCreateCategory = (body: TCreateCategoryBody): string[] | null => {
  const errors: string[] = [];

  if (!isNonEmptyString(body?.categoryName, 2)) {
    errors.push("Category name is required and must be at least 2 characters");
  }
  if (body?.description !== undefined && typeof body.description !== "string") {
    errors.push("description must be a string");
  }

  return errors.length ? errors : null;
};

export const CategoryValidation = {
  validateCreateCategory,
};
