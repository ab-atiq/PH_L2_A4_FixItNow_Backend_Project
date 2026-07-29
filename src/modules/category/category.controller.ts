import { Request, Response } from "express";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await prisma.category.create({ data: req.body });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Category created successfully",
    data: category,
  });
});

const getCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Categories retrieved successfully",
    data: categories,
  });
});

export const CategoryController = { createCategory, getCategories };
