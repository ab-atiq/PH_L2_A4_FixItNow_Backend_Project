import { z } from "zod";

const createServiceValidation = z.object({
  body: z.object({
    name: z.string({ required_error: "Service name is required" }).min(2),
    description: z.string().optional(),
    categoryId: z.string({ required_error: "Category ID is required" }).min(1),
    basePrice: z
      .number({ required_error: "Base price is required" })
      .nonnegative(),
  }),
});

export const ServiceValidation = {
  createServiceValidation,
};
