import { Request, Response } from "express";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createProfile = catchAsync(async (req: Request, res: Response) => {
  const existingProfile = await prisma.technicianProfile.findUnique({
    where: { userId: req.user!.id },
  });

  if (existingProfile) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Technician profile already exists",
    );
  }

  const profile = await prisma.technicianProfile.create({
    data: {
      userId: req.user!.id,
      skills: req.body.skills,
      experience: req.body.experience,
      hourlyRate: req.body.hourlyRate,
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

export const TechnicianProfileController = { createProfile, getMyProfile };
