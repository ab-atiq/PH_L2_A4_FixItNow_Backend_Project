import { Request, Response } from "express";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  // same name check can not duplicate category name
  const existingCategory = await prisma.category.findFirst({
    where: { categoryName: req.body.categoryName },
  });

  if (existingCategory) {
    sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "Category with this name already exists.",
      data: {},
    });
    return;
  }

  const category = await prisma.category.create({
    data: {
      categoryName: req.body.categoryName,
      description: req.body.description,
    },
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Category created successfully",
    data: category,
  });
});

const getCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { categoryName: "asc" },
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Categories retrieved successfully",
    data: categories,
  });
});

export const CategoryController = { createCategory, getCategories };
