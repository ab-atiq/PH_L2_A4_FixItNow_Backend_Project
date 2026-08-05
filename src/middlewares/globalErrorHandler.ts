import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";
import AppError from "../errors/AppError";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode;
  let message = "Something went wrong!";
  let errorDetails: unknown = err;

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "You have provided incorrect field type or missing fields";
    errorDetails = err.message;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorDetails = err.meta;

    if (err.code === "P2002") {
      message = `Duplicate value for field: ${(err.meta?.target as string[])?.join(", ")}`;
    } else if (err.code === "P2003") {
      message = "Foreign key constraint failed";
    } else if (err.code === "P2025") {
      message = "The requested record was not found";
    } else {
      message = "Database request error";
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "Failed to connect to the database";
    errorDetails = err.message;
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "Error occurred during query execution";
    errorDetails = err.message;
  } else if (err instanceof AppError) {
    //  err.statusCode number convert into string
    statusCode = err.statusCode.toString();
    message = err.message;
    errorDetails = err.details ?? err.stack;
  } else if (err instanceof Error) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = err.message;
    errorDetails = err.stack;
  } else {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  }

  res.status(Number(statusCode)).json({
    success: false,
    message,
    errorDetails,
  });
};
