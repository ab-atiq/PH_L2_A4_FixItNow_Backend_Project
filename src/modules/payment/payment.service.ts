// src/modules/payment/payment.service.ts
import httpStatus from "http-status";
import Stripe from "stripe";
import { BookingStatus, PaymentProvider, PaymentStatus } from "../../../generated/prisma/enums";
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
      "Payment can only be initiated for an accepted booking"
    );
  }

  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (existingPayment) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "A payment already exists for this booking"
    );
  }

  const amount = booking.service.basePrice;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    metadata: { bookingId },
  });

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

  return {
    clientSecret: paymentIntent.client_secret,
    payment,
  };
};

const confirmPayment = async (transactionId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  if (payment.status === PaymentStatus.COMPLETED) {
    return payment;
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { transactionId },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
    });

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { status: BookingStatus.PAID },
    });

    return updatedPayment;
  });

  return result;
};

const markPaymentFailed = async (transactionId: string) => {
  const payment = await prisma.payment.update({
    where: { transactionId },
    data: { status: PaymentStatus.FAILED },
  });

  return payment;
};

export const paymentService = {
  createPaymentIntent,
  confirmPayment,
  markPaymentFailed,
};