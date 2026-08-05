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
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    const headerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const cookieToken = req.cookies?.accessToken as string | undefined;

    const token = headerToken || cookieToken;

    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "You are not authorized. Please log in.",
      );
    }

    const verified = jwtHelper.verifyToken(token, config.jwt_access_secret);

    if (!verified.success) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        `Invalid or expired token. ${verified.error || "Please log in again."}`,
      );
    }

    const decoded = verified.data as TJwtPayload;

    const { id, email, role } = decoded;

    const user = await prisma.user.findUnique({
      where: { id, email },
    });

    if (!user) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "User not found. Please log in again.",
      );
    }

    if (allowedRoles.length && !allowedRoles.includes(role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You do not have permission to access this resource.",
      );
    }

    req.user = { id, name: user.name, email, role };

    next();
  });
};
