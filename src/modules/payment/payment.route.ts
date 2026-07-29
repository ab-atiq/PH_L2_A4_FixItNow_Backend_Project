import express, { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { paymentController } from "./payment.controller";

const router = Router();

// NOTE: mount this router's /webhook path with express.raw() in app.ts BEFORE express.json()
router.post("/webhook", paymentController.handleStripeWebhook);

router.post("/create", auth(Role.CUSTOMER), paymentController.createPaymentIntent);
router.post("/confirm", auth(Role.CUSTOMER), paymentController.confirmPayment);
router.get("/", auth(Role.CUSTOMER), paymentController.getMyPayments);

export const paymentRoutes = router;
