import { Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../../generated/prisma/client";
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
  const { type, location, rating, minPrice, maxPrice, search } = req.query;

  const filterType =
    typeof type === "string" && type.trim() ? type.trim() : undefined;
  const filterLocation =
    typeof location === "string" && location.trim()
      ? location.trim()
      : undefined;
  const minRating = typeof rating === "string" ? Number(rating) : undefined;
  const minPriceValue =
    typeof minPrice === "string" ? Number(minPrice) : undefined;
  const maxPriceValue =
    typeof maxPrice === "string" ? Number(maxPrice) : undefined;
  const filterSearch =
    typeof search === "string" && search.trim() ? search.trim() : undefined;

  const technicianWhere: Prisma.TechnicianProfileWhereInput = {};
  const categoryWhere: Prisma.CategoryWhereInput = {};
  const serviceWhere: Prisma.ServiceWhereInput = {};

  if (filterLocation) {
    technicianWhere.location = {
      contains: filterLocation,
      mode: "insensitive",
    };
  }

  if (filterType) {
    categoryWhere.categoryName = {
      contains: filterType,
      mode: "insensitive",
    };
  }

  if (filterSearch) {
    serviceWhere.serviceName = {
      contains: filterSearch,
      mode: "insensitive",
    };
  }

  const priceFilter: Prisma.FloatFilter = {} as Prisma.FloatFilter;
  if (!Number.isNaN(minPriceValue) && minPriceValue !== undefined) {
    priceFilter.gte = minPriceValue;
  }
  if (!Number.isNaN(maxPriceValue) && maxPriceValue !== undefined) {
    priceFilter.lte = maxPriceValue;
  }

  if (Object.keys(priceFilter).length) {
    serviceWhere.basePrice = priceFilter;
  }

  let technicianIdsByRating: string[] | undefined;

  if (!Number.isNaN(minRating) && minRating !== undefined) {
    const ratingResults = await prisma.review.groupBy({
      by: ["technicianId"],
      _avg: { rating: true },
    });

    technicianIdsByRating = ratingResults
      .filter(
        (item) => item._avg.rating !== null && item._avg.rating >= minRating,
      )
      .map((item) => item.technicianId);

    if (technicianIdsByRating.length === 0) {
      return sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Services retrieved successfully",
        data: [],
      });
    }

    technicianWhere.user = {
      id: { in: technicianIdsByRating },
    };
  }

  const services = await prisma.service.findMany({
    where: {
      ...serviceWhere,
      category: Object.keys(categoryWhere).length ? categoryWhere : undefined,
      technician: Object.keys(technicianWhere).length
        ? technicianWhere
        : undefined,
    },
    include: {
      category: true,
      technician: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const reviewAverages = await prisma.review.groupBy({
    by: ["technicianId"],
    _avg: { rating: true },
  });

  const ratingMap = reviewAverages.reduce<Record<string, number>>(
    (acc, item) => {
      if (item._avg.rating !== null) {
        acc[item.technicianId] = item._avg.rating;
      }
      return acc;
    },
    {},
  );

  const servicesWithRating = services.map((service) => ({
    ...service,
    averageRating: ratingMap[service.technician.user.id] ?? null,
  }));

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Services retrieved successfully",
    data: servicesWithRating,
  });
});

export const ServiceController = { createService, getServices };
