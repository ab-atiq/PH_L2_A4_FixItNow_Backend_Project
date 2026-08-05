type CreateProfilePayload = {
  skills?: unknown;
  experience?: unknown;
  hourlyRate?: unknown;
  isAvailable?: unknown;
  location?: unknown;
};

type AvailabilitySlot = {
  start?: unknown;
  end?: unknown;
  note?: unknown;
};

type UpdateAvailabilityPayload = {
  availabilitySlots?: unknown;
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
    errors.push(
      "Experience is required and must be a non-negative integer number",
    );
  }

  if (typeof payload.hourlyRate !== "number" || payload.hourlyRate < 0) {
    errors.push(
      "Hourly rate is required and must be a non-negative integer number",
    );
  }

  if (
    payload.isAvailable !== undefined &&
    typeof payload.isAvailable !== "boolean"
  ) {
    errors.push("isAvailable must be a boolean value");
  }

  if (
    payload.location !== undefined &&
    (typeof payload.location !== "string" || payload.location.trim().length < 2)
  ) {
    errors.push("location must be a string with at least 2 characters");
  }

  return errors.length > 0 ? errors : null;
};

const validateAvailabilitySlots = (
  payload: UpdateAvailabilityPayload,
): string[] | null => {
  const errors: string[] = [];

  if (!Array.isArray(payload.availabilitySlots)) {
    errors.push("availabilitySlots is required and must be an array");
    return errors;
  }

  if (payload.availabilitySlots.length === 0) {
    return null;
  }

  payload.availabilitySlots.forEach((slot, index) => {
    const entry = slot as AvailabilitySlot;

    if (typeof entry !== "object" || entry === null) {
      errors.push(`availabilitySlots[${index}] must be an object`);
      return;
    }

    if (typeof entry.start !== "string" || !entry.start.trim()) {
      errors.push(
        `availabilitySlots[${index}].start is required and must be a string`,
      );
    }
    if (typeof entry.end !== "string" || !entry.end.trim()) {
      errors.push(
        `availabilitySlots[${index}].end is required and must be a string`,
      );
    }
    if (entry.note !== undefined && typeof entry.note !== "string") {
      errors.push(
        `availabilitySlots[${index}].note must be a string if provided`,
      );
    }
  });

  return errors.length ? errors : null;
};

export const TechnicianProfileValidation = {
  createProfileValidation,
  validateAvailabilitySlots,
};
