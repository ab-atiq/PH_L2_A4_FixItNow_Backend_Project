type CreateProfilePayload = {
  skills?: unknown;
  experience?: unknown;
  hourlyRate?: unknown;
  isAvailable?: unknown;
};

const createProfileValidation = (payload: CreateProfilePayload) => {
  const errors: string[] = [];

  if (typeof payload.skills !== "string" || payload.skills.trim().length < 3) {
    errors.push("Skills are required and must be at least 3 characters long");
  }

  if (
    typeof payload.experience !== "number" ||
    !Number.isInteger(payload.experience) ||
    payload.experience < 0
  ) {
    errors.push("Experience is required and must be a non-negative integer number");
  }

  if (typeof payload.hourlyRate !== "number" || payload.hourlyRate < 0) {
    errors.push("Hourly rate is required and must be a non-negative integer number");
  }

  if (
    payload.isAvailable !== undefined &&
    typeof payload.isAvailable !== "boolean"
  ) {
    errors.push("isAvailable must be a boolean value");
  }

  return errors.length > 0 ? errors : null;
};

export const TechnicianProfileValidation = {
  createProfileValidation,
};
