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

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid payment id");
  }

  const payment = await paymentService.getPaymentById(id, req.user!.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment details retrieved successfully",
    data: payment,
  });
});

const failPayment = catchAsync(async (req: Request, res: Response) => {
  const { transactionId } = req.body;
  const payment = await paymentService.markPaymentFailed(transactionId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment marked as failed successfully",
    data: payment,
  });
});

const getCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const amount = req.body.amount;
  const bookingId = req.body.bookingId;
  const currency = req.body.currency;

  const session = await paymentService.createCheckoutSession(req.user!.id, {
    amount: amount ? Number(amount) : undefined,
    bookingId: typeof bookingId === "string" ? bookingId : undefined,
    currency: typeof currency === "string" ? currency : "usd",
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Checkout session created successfully",
    data: session,
  });
});

const handleCheckoutSuccess = catchAsync(
  async (req: Request, res: Response) => {
    const sessionId = Array.isArray(req.query.session_id)
      ? req.query.session_id[0]
      : req.query.session_id;

    if (!sessionId) {
      throw new AppError(httpStatus.BAD_REQUEST, "Missing Stripe session id");
    }

    const payment = await paymentService.confirmPayment(sessionId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment completed successfully",
      data: payment,
    });
  },
);

const handleCheckoutCancel = catchAsync(async (req: Request, res: Response) => {
  const sessionId = Array.isArray(req.query.session_id)
    ? req.query.session_id[0]
    : req.query.session_id;

  if (!sessionId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Missing Stripe session id");
  }

  const payment = await paymentService.markPaymentFailed(sessionId as string);

  sendResponse(res, {
    success: false,
    statusCode: httpStatus.OK,
    message: "Payment was cancelled",
    data: payment,
  });
});

const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      config.stripe_webhook_secret,
    );
  } catch (error) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Webhook signature verification failed: ${(error as Error).message}`,
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
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      await paymentService.confirmPayment(checkoutSession.id);
      break;
    }
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      await paymentService.markPaymentFailed(checkoutSession.id);
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
  failPayment,
  getMyPayments,
  getPaymentById,
  handleStripeWebhook,
  getCheckoutSession,
  handleCheckoutSuccess,
  handleCheckoutCancel,
};
