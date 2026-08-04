import {
  isNonEmptyString,
  isOneOf,
  isValidEmail,
} from "../../utils/validators";

export type TRegisterBody = {
  name: string;
  email: string;
  password: string;
  role?: "CUSTOMER" | "TECHNICIAN" | "ADMIN";
};

export type TLoginBody = {
  email: string;
  password: string;
};

const validateRegister = (body: TRegisterBody): string[] | null => {
  const errors: string[] = [];

  if (!isNonEmptyString(body?.name, 2)) {
    errors.push("name is required and must be at least 2 characters");
  }
  if (!isValidEmail(body?.email)) {
    errors.push("email is required and must be a valid email address");
  }
  if (!isNonEmptyString(body?.password, 6)) {
    errors.push("password is required and must be at least 6 characters");
  }
  if (
    body?.role !== undefined &&
    !isOneOf(body.role, ["CUSTOMER", "TECHNICIAN", "ADMIN"] as const)
  ) {
    errors.push("role must be one of CUSTOMER, TECHNICIAN, ADMIN");
  }

  return errors.length ? errors : null;
};

const validateLogin = (body: TLoginBody): string[] | null => {
  const errors: string[] = [];

  if (!isValidEmail(body?.email)) {
    errors.push("email is required and must be a valid email address");
  }
  if (!isNonEmptyString(body?.password)) {
    errors.push("password is required");
  }

  return errors.length ? errors : null;
};

export const AuthValidation = {
  validateRegister,
  validateLogin,
};
