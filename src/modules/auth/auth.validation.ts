import { z } from "zod";

const registerValidation = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }).min(2),
    email: z.string({ required_error: "Email is required" }).email(),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    role: z.enum(["CUSTOMER", "TECHNICIAN", "ADMIN"]).optional(),
  }),
});

const loginValidation = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email(),
    password: z.string({ required_error: "Password is required" }),
  }),
});

export const AuthValidation = {
  registerValidation,
  loginValidation,
};
