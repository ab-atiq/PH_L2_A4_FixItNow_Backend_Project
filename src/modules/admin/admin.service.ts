import httpStatus from "http-status";
import { ActiveStatus, Role } from "../../../generated/prisma/enums";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { TCreateCategoryBody } from "./admin.interface";

const getAllUsers = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { technicianProfile: true },
  });
};

const updateUserStatus = async (id: string, activeStatus: ActiveStatus) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // already user blocked check
  //   if (user && user.activeStatus === ActiveStatus.BLOCKED) {
  //     throw new AppError(httpStatus.BAD_REQUEST, "User is already blocked");
  //   }

  return prisma.user.update({
    where: { id },
    data: { activeStatus },
  });
};

const getAllBookings = async () => {
  return prisma.booking.findMany({
    include: {
      customer: { select: { id: true, name: true, email: true } },
      technician: { select: { id: true, name: true, email: true } },
      service: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getAllCategories = async () => {
  return prisma.category.findMany({ orderBy: { categoryName: "asc" } });
};

const createCategory = async (payload: TCreateCategoryBody) => {
  const existingCategory = await prisma.category.findFirst({
    where: { categoryName: payload.categoryName },
  });

  if (existingCategory) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Category with this name already exists",
    );
  }

  return prisma.category.create({ data: payload });
};

export const adminService = {
  getAllUsers,
  updateUserStatus,
  getAllBookings,
  getAllCategories,
  createCategory,
};
