import httpStatus from "http-status";
import {
  BookingStatus,
  PaymentProvider,
  PaymentStatus,
} from "../../../generated/prisma/enums";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

const createPaymentIntent = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  if (booking.status !== BookingStatus.ACCEPTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment can only be initiated for an accepted booking",
    );
  }

  // now check if a payment already exists for this booking
  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (existingPayment) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "A payment already exists for this booking. No need to create a new payment intent. Please proceed with the existing payment.",
    );
  }

  // create a new payment intent with Stripe
  const amount = booking.service.basePrice;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // convert to cents
    currency: "usd",
    metadata: { bookingId },
  });

  // create a new payment record in the database with status PENDING
  const payment = await prisma.payment.create({
    data: {
      transactionId: paymentIntent.id,
      bookingId,
      amount,
      method: "card",
      provider: PaymentProvider.STRIPE,
      status: PaymentStatus.PENDING,
    },
  });

  return { clientSecret: paymentIntent.client_secret, payment };
};

const confirmPayment = async (transactionId: string) => {
  const payment = await prisma.payment.findUnique({ where: { transactionId } });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  // If the payment is already completed, return payment info without making any changes
  if (payment.status === PaymentStatus.COMPLETED) {
    return payment;
  }

  return prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { transactionId },
      data: { status: PaymentStatus.COMPLETED, paidAt: new Date() },
    });

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { status: BookingStatus.PAID },
    });

    return updatedPayment;
  });
};

const markPaymentFailed = async (transactionId: string) => {
  return prisma.payment.update({
    where: { transactionId },
    data: { status: PaymentStatus.FAILED },
  });
};

const getMyPayments = async (customerId: string) => {
  return prisma.payment.findMany({
    where: { booking: { customerId } },
    include: { booking: true },
    orderBy: { paidAt: "desc" },
  });
};

const getPaymentById = async (paymentId: string, customerId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: true },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  if (payment.booking.customerId !== customerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to view this payment",
    );
  }

  return payment;
};

export const paymentService = {
  createPaymentIntent,
  confirmPayment,
  markPaymentFailed,
  getMyPayments,
  getPaymentById,
};
