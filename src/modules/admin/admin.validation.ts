import { isOneOf } from "../../utils/validators";
import { ActiveStatus } from "../../../generated/prisma/enums";
import { TUpdateUserStatusBody } from "./admin.interface";

const validateUpdateUserStatus = (
  body: TUpdateUserStatusBody,
): string[] | null => {
  const errors: string[] = [];

  if (!isOneOf(body?.activeStatus, ["ACTIVE", "BLOCKED"] as const)) {
    errors.push("activeStatus must be either ACTIVE or BLOCKED");
  }

  return errors.length ? errors : null;
};

export const AdminValidation = {
  validateUpdateUserStatus,
};
