import { type Request, type Response } from "express";
import httpStatus from "http-status";
import { Role } from "../../../generated/prisma/enums";
import AppError from "../../errors/AppError";
import { adminService } from "./admin.service";
import { catchAsync } from "../../utils/catchAsync";
import { isValidUUID } from "../../utils/validators";
import { sendResponse } from "../../utils/sendResponse";

const getUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await adminService.getAllUsers();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    data: users,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid user id");
  }

  const { activeStatus } = req.body;
  const updatedUser = await adminService.updateUserStatus(id, activeStatus);

  const updatedUserWithoutPassword = { ...updatedUser, password: undefined };

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User status updated successfully",
    data: updatedUserWithoutPassword,
  });
});

const getBookings = catchAsync(async (req: Request, res: Response) => {
  const bookings = await adminService.getAllBookings();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Bookings retrieved successfully",
    data: bookings,
  });
});

const getCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await adminService.getAllCategories();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Categories retrieved successfully",
    data: categories,
  });
});

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await adminService.createCategory(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Category created successfully",
    data: category,
  });
});

export const AdminController = {
  getUsers,
  updateUserStatus,
  getBookings,
  getCategories,
  createCategory,
};
