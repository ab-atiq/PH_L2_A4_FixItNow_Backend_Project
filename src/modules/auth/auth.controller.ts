// src/controllers/auth.controller.ts
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import httpStatus from "http-status";
import config from "../config";
import AppError from "../errors/AppError";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { jwtHelper } from "../utils/jwtHelper";
import { sendResponse } from "../utils/sendResponse";

const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds)
  );

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });

  const { password: _password, ...userWithoutPassword } = user;

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: userWithoutPassword,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const token = jwtHelper.generateToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in
  );

  const { password: _password, ...userWithoutPassword } = user;

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Logged in successfully",
    data: {
      token,
      user: userWithoutPassword,
    },
  });
});

export const AuthController = {
  register,
  login,
};