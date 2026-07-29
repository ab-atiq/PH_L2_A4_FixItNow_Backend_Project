import { Request, Response } from "express";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createService = catchAsync(async (req: Request, res: Response) => {
  console.log("Request body:", req.body);
  console.log("Request user:", req.user);
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId: req.user!.id },
  });

  if (!technicianProfile) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Create a technician profile before adding a service",
    );
  }

  const service = await prisma.service.create({
    data: { ...req.body, technicianId: technicianProfile.id },
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Service created successfully",
    data: service,
  });
});

const getServices = catchAsync(async (req: Request, res: Response) => {
  const { categoryId } = req.query;

  const services = await prisma.service.findMany({
    where: categoryId ? { categoryId: String(categoryId) } : undefined,
    include: {
      category: true,
      technician: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Services retrieved successfully",
    data: services,
  });
});

export const ServiceController = { createService, getServices };
