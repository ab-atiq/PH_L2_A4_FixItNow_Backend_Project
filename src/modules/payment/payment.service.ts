import httpStatus from "http-status";
import {
  BookingStatus,
  PaymentProvider,
  PaymentStatus,
} from "../../../generated/prisma/enums";
import config from "../../config";
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

type TCreateCheckoutSessionPayload = {
  amount?: number;
  bookingId?: string;
  currency?: string;
};

const createCheckoutSession = async (
  userId: string,
  payload: TCreateCheckoutSessionPayload = {},
) => {
  const { amount, bookingId, currency = "usd" } = payload;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (!bookingId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Booking ID is required to create a Stripe checkout session",
      );
    }

    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { service: true },
    });

    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }

    if (booking.customerId !== userId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to pay for this booking",
      );
    }

    if (booking.status !== BookingStatus.ACCEPTED) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Payment can only be initiated for an accepted booking",
      );
    }

    const existingPayment = await tx.payment.findUnique({
      where: { bookingId },
    });

    if (existingPayment) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        existingPayment.status === PaymentStatus.COMPLETED
          ? "This booking is already paid."
          : "A payment already exists for this booking. Please complete or cancel the existing payment first.",
      );
    }

    const paymentAmount = amount ?? booking.service.basePrice;

    if (!paymentAmount || paymentAmount <= 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Payment amount must be greater than zero",
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: Math.round(paymentAmount * 100),
            product_data: {
              name: `FixItNow booking payment`,
            },
          },
          quantity: 1,
        },
      ],
      // success_url: `${config.app_url}/api/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      // cancel_url: `${config.app_url}/api/payments/cancel?session_id={CHECKOUT_SESSION_ID}`,
      success_url: `http://localhost:${config.port}/api/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:${config.port}/api/payments/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        userId: user.id,
        bookingId: booking.id,
        amount: String(paymentAmount),
      },
    });

    const payment = await tx.payment.create({
      data: {
        transactionId: session.id,
        bookingId: booking.id,
        amount: paymentAmount,
        method: "card",
        provider: PaymentProvider.STRIPE,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      paymentUrl: session.url,
      payment,
    };
  });
};

export const paymentService = {
  createPaymentIntent,
  confirmPayment,
  markPaymentFailed,
  getMyPayments,
  getPaymentById,
  createCheckoutSession,
};
