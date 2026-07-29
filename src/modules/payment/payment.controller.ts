import { Request, Response } from "express";
import httpStatus from "http-status";
import Stripe from "stripe";
import config from "../../config";
import AppError from "../../errors/AppError";
import { stripe } from "../../lib/stripe";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const { bookingId } = req.body;
  const result = await paymentService.createPaymentIntent(bookingId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Payment intent created successfully",
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const { transactionId } = req.body;
  const payment = await paymentService.confirmPayment(transactionId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment confirmed successfully",
    data: payment,
  });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const payments = await paymentService.getMyPayments(req.user!.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment history retrieved successfully",
    data: payments,
  });
});

const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      config.stripe_webhook_secret
    );
  } catch (error) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Webhook signature verification failed: ${(error as Error).message}`
    );
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await paymentService.confirmPayment(paymentIntent.id);
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await paymentService.markPaymentFailed(paymentIntent.id);
      break;
    }
    default:
      break;
  }

  res.status(httpStatus.OK).json({ received: true });
});

export const paymentController = {
  createPaymentIntent,
  confirmPayment,
  getMyPayments,
  handleStripeWebhook,
};
