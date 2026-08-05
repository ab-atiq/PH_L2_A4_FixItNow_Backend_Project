import { Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "@prisma/client";
import { Role } from "../../../generated/prisma/enums";
import AppError from "../../errors/AppError";
import { bookingService } from "../booking/booking.service";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { isValidUUID } from "../../utils/validators";
import { sendResponse } from "../../utils/sendResponse";

const createProfile = catchAsync(async (req: Request, res: Response) => {
  // check if the technician profile already exists for the user
  const existingProfile = await prisma.technicianProfile.findUnique({
    where: { userId: req.user!.id },
  });

  if (existingProfile) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Technician profile already exists",
    );
  }

  // create a new technician profile
  const profile = await prisma.technicianProfile.create({
    data: {
      userId: req.user!.id,
      skills: req.body.skills,
      experience: req.body.experience,
      hourlyRate: req.body.hourlyRate,
      location: req.body.location,
      isAvailable: req.body.isAvailable ?? true,
    },
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Technician profile created successfully",
    data: profile,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: req.user!.id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Technician profile not found");
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technician profile retrieved successfully",
    data: profile,
  });
});

const getBookings = catchAsync(async (req: Request, res: Response) => {
  const bookings = await bookingService.getMyBookings(
    req.user!.id,
    Role.TECHNICIAN,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technician bookings retrieved successfully",
    data: bookings,
  });
});

const updateAvailability = catchAsync(async (req: Request, res: Response) => {
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: req.user!.id },
  });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Technician profile not found");
  }

  const availabilitySlots = req.body.availabilitySlots;

  const updatedProfile = await prisma.technicianProfile.update({
    where: { id: profile.id },
    data: { availabilitySlots },
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Availability slots updated successfully",
    data: updatedProfile,
  });
});

const getTechnicians = catchAsync(async (req: Request, res: Response) => {
  const {
    skills,
    location,
    minExperience,
    maxExperience,
    minRate,
    maxRate,
    available,
    rating,
    serviceType,
  } = req.query;

  const technicianWhere: Prisma.TechnicianProfileWhereInput = {};

  if (typeof skills === "string" && skills.trim()) {
    technicianWhere.skills = {
      contains: skills.trim(),
      mode: "insensitive",
    };
  }

  if (typeof location === "string" && location.trim()) {
    technicianWhere.location = {
      contains: location.trim(),
      mode: "insensitive",
    };
  }

  const minExperienceValue =
    typeof minExperience === "string" ? Number(minExperience) : undefined;
  if (!Number.isNaN(minExperienceValue) && minExperienceValue !== undefined) {
    technicianWhere.experience = {
      gte: minExperienceValue,
      ...(technicianWhere.experience as Prisma.IntFilter),
    };
  }

  const maxExperienceValue =
    typeof maxExperience === "string" ? Number(maxExperience) : undefined;
  if (!Number.isNaN(maxExperienceValue) && maxExperienceValue !== undefined) {
    technicianWhere.experience = {
      lte: maxExperienceValue,
      ...(technicianWhere.experience as Prisma.IntFilter),
    };
  }

  const minRateValue =
    typeof minRate === "string" ? Number(minRate) : undefined;
  const maxRateValue =
    typeof maxRate === "string" ? Number(maxRate) : undefined;
  if (
    (!Number.isNaN(minRateValue) && minRateValue !== undefined) ||
    (!Number.isNaN(maxRateValue) && maxRateValue !== undefined)
  ) {
    const rateFilter: Prisma.FloatFilter = {} as Prisma.FloatFilter;
    if (!Number.isNaN(minRateValue) && minRateValue !== undefined) {
      rateFilter.gte = minRateValue;
    }
    if (!Number.isNaN(maxRateValue) && maxRateValue !== undefined) {
      rateFilter.lte = maxRateValue;
    }
    technicianWhere.hourlyRate = rateFilter;
  }

  if (typeof available === "string" && available.trim()) {
    if (available === "true" || available === "false") {
      technicianWhere.isAvailable = available === "true";
    }
  }

  if (typeof serviceType === "string" && serviceType.trim()) {
    technicianWhere.services = {
      some: {
        category: {
          categoryName: {
            contains: serviceType.trim(),
            mode: "insensitive",
          },
        },
      },
    };
  }

  const minRatingValue =
    typeof rating === "string" ? Number(rating) : undefined;
  if (!Number.isNaN(minRatingValue) && minRatingValue !== undefined) {
    const ratingResults = await prisma.review.groupBy({
      by: ["technicianId"],
      _avg: { rating: true },
    });

    const technicianIds = ratingResults
      .filter(
        (item) =>
          item._avg.rating !== null && item._avg.rating >= minRatingValue,
      )
      .map((item) => item.technicianId);

    if (technicianIds.length === 0) {
      return sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Technicians retrieved successfully",
        data: [],
      });
    }

    technicianWhere.user = {
      id: { in: technicianIds },
    };
  }

  const technicians = await prisma.technicianProfile.findMany({
    where: Object.keys(technicianWhere).length ? technicianWhere : undefined,
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      services: {
        include: { category: true },
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

  const techniciansWithRating = technicians.map((technician) => ({
    ...technician,
    averageRating: ratingMap[technician.user.id] ?? null,
  }));

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technicians retrieved successfully",
    data: techniciansWithRating,
  });
});

const getTechnicianById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid technician id");
  }

  const profile = await prisma.technicianProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      services: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Technician not found");
  }

  const reviews = await prisma.review.findMany({
    where: { technicianId: profile.userId },
    include: {
      customer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const ratingAggregate = await prisma.review.aggregate({
    where: { technicianId: profile.userId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technician profile retrieved successfully",
    data: {
      ...profile,
      reviews,
      averageRating: ratingAggregate._avg.rating ?? null,
      reviewCount: ratingAggregate._count.rating,
    },
  });
});

export const TechnicianProfileController = {
  createProfile,
  getMyProfile,
  getTechnicians,
  getTechnicianById,
  updateAvailability,
  getBookings,
};
