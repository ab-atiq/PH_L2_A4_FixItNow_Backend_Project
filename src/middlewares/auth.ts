import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import config from "../config";
import AppError from "../errors/AppError";
import { Role } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { jwtHelper, TJwtPayload } from "../utils/jwtHelper";

declare global {
  namespace Express {
    interface Request {
      user?: TJwtPayload;
    }
  }
}

export const auth = (...allowedRoles: Role[]) => {
  return catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization;

      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      if (!token) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "You are not authorized. Please log in."
        );
      }

      let decoded: TJwtPayload;
      try {
        decoded = jwtHelper.verifyToken(token, config.jwt_access_secret);
      } catch (error) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Invalid or expired token. Please log in again."
        );
      }

      const { id, email, role } = decoded;

      const user = await prisma.user.findUnique({
        where: { id, email },
      });

      if (!user) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "User not found. Please log in again."
        );
      }

      if (allowedRoles.length && !allowedRoles.includes(role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You do not have permission to access this resource."
        );
      }

      req.user = { id, name: user.name, email, role };

      next();
    }
  );
};
