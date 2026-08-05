import { Request, Response } from "express";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createService = catchAsync(async (req: Request, res: Response) => {
  // console.log("Request body:", req.body);
  // console.log("Request user:", req.user);
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId: req.user!.id },
  });

  if (!technicianProfile) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Create a technician profile before adding a service",
    );
  }

  // same service name check for the same technician
  const existingService = await prisma.service.findFirst({
    where: {
      serviceName: req.body.serviceName,
      technicianId: technicianProfile.id,
    },
  });

  if (existingService) {
    throw new AppError(
      httpStatus.CONFLICT,
      "A service with the same name already exists for this technician",
    );
  }

  // short version of creating new service data with technicianId
  // const newServiceData = {
  //   ...req.body,
  //   technicianId: technicianProfile.id,
  // };

  // long version of creating new service data with technicianId
  const newServiceData = {
    serviceName: req.body.serviceName,
    description: req.body.description,
    categoryId: req.body.categoryId,
    basePrice: req.body.basePrice,
    technicianId: technicianProfile.id,
  };

  const service = await prisma.service.create({
    data: newServiceData,
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
