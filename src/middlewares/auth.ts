import { type NextFunction, type Request, type Response } from "express";
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
    // const authHeader = req.headers.authorization;

    // const headerToken = authHeader?.startsWith("Bearer ")
    //   ? authHeader.split(" ")[1]
    //   : authHeader;

    // const cookieToken = req.cookies?.accessToken as string | undefined;

    // const token = headerToken || cookieToken;

    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

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
      where: { id, email, role },
    });

    if (!user) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "User not found. Please log in again.",
      );
    }

    if (user.activeStatus === "BLOCKED") {
      throw new Error("Your account has been blocked. Please contact support.");
    }

    // role check
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
