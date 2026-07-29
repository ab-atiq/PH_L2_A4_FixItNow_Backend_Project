import { z } from "zod";

const createProfileValidation = z.object({
  body: z.object({
    skills: z.string({ required_error: "Skills are required" }).min(3),
    experience: z
      .number({ required_error: "Experience is required" })
      .int()
      .nonnegative(),
    hourlyRate: z
      .number({ required_error: "Hourly rate is required" })
      .nonnegative(),
    isAvailable: z.boolean().optional(),
  }),
});

export const TechnicianProfileValidation = {
  createProfileValidation,
};
