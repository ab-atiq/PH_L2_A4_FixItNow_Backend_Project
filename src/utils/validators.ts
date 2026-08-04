// Lightweight, dependency-free runtime validators with TypeScript type guards.
// Replaces schema libraries (e.g. zod) with plain TS checks.

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isNonEmptyString = (value: unknown, minLength = 1): value is string =>
  typeof value === "string" && value.trim().length >= minLength;

export const isValidEmail = (value: unknown): value is string =>
  typeof value === "string" && emailRegex.test(value);

export const isValidUUID = (value: unknown): value is string =>
  typeof value === "string" && uuidRegex.test(value);

export const isPositiveNumber = (value: unknown): value is number =>
  typeof value === "number" && !Number.isNaN(value) && value > 0;

export const isValidDate = (value: unknown): boolean => {
  if (typeof value !== "string" && !(value instanceof Date)) return false;
  const date = new Date(value as string);
  return !Number.isNaN(date.getTime());
};

export const isOneOf = <T extends string>(
  value: unknown,
  options: readonly T[]
): value is T => typeof value === "string" && (options as readonly string[]).includes(value);

export const isInRange = (value: unknown, min: number, max: number): value is number =>
  typeof value === "number" && !Number.isNaN(value) && value >= min && value <= max;
