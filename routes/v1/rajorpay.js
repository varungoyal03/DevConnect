import express from "express";
import { userAuth } from "../../middlewares/auth.js";
const paymentRouter = express.Router();
import Razorpayinstance from "../../utils/rajorpay.js";
import Payment from "../../models/payment.js";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import User from "../../models/User.schema.js";

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    const order = await Razorpayinstance.orders.create({
      amount: membershipAmount[membershipType] * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType: membershipType,
      },
    });

    console.log(order);

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    // Return back my order details to frontend
    res.json({ savedPayment, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    console.log("Webhook Called");
    const webhookSignature = req.get("X-Razorpay-Signature");

    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      console.log("INvalid Webhook Signature");
      return res.status(400).json({ msg: "Webhook signature is invalid" });
    }

    // Udpate my payment Status in DB
    const paymentDetails = req.body.payload.payment.entity;
    const orderId = paymentDetails.order_id;

    const payment = await Payment.findOne({ orderId });

    payment.status = paymentDetails.status;
     payment.paymentId = paymentDetails.id;           // Razorpay payment id
    await payment.save();

    // Update the user as premium

    if (req.body.event == "payment.captured") {
      const user = await User.findOne({ _id: payment.userId });
      user.isPremium = true;
      user.membershipType = payment.notes.membershipType;

      await user.save();
    }
    if (req.body.event == "payment.failed") {
      console.log("Payment failed for order:", orderId);
    }

    // return success response to razorpay

    return res.status(200).json({ msg: "Webhook received successfully" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
  try {
    const user = req.user;

    return res.json({ isPremium: user.isPremium });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

export default paymentRouter;
