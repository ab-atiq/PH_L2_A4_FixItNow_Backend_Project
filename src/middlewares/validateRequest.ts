import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import AppError from "../errors/AppError";

// A validator inspects req.body (typed as T) and returns an array of
// human-readable error messages, or null when the payload is valid.
export type TValidator<T = any> = (payload: T) => string[] | null;

export const validateRequest = <T = any>(validator: TValidator<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors = validator(req.body as T);

    if (errors && errors.length > 0) {
      return next(new AppError(httpStatus.BAD_REQUEST, "Validation Error", errors));
    }

    next();
  };
};
