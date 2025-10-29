import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";

dotenv.config();
const router = express.Router();

// ======================
// INITIALIZE PAYMENT
// ======================
router.post("/initialize", async (req, res) => {
  const { fullName, email, phone, course, paymentType, amount, password } =
    req.body;

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        callback_url: "http://localhost:5173/payment-success",
        metadata: { fullName, email, phone, course, paymentType, password },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data.data);
  } catch (error) {
    console.error("Payment Init Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Payment initialization failed" });
  }
});

// ======================
// VERIFY PAYMENT & CREATE USER
// ======================
router.get("/verify/:reference", async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;

    if (data.status !== "success") {
      return res
        .status(400)
        .json({ success: false, message: "Payment failed" });
    }

    // Save payment info
    let payment = await Payment.findOne({ reference });
    if (!payment) {
      payment = await Payment.create({
        name: data.metadata.fullName,
        email: data.metadata.email,
        course: data.metadata.course,
        paymentType: data.metadata.paymentType,
        reference,
        amount: data.amount / 100,
        status: "success",
      });
    }

    // ✅ Create user automatically after payment
    let user = await User.findOne({ email: data.metadata.email });
    if (!user) {
      const hashedPassword = await bcrypt.hash(data.metadata.password, 10);
      user = await User.create({
        fullName: data.metadata.fullName,
        email: data.metadata.email,
        phone: data.metadata.phone,
        password: hashedPassword,
        course: data.metadata.course,
        paymentType: data.metadata.paymentType,
        amountPaid: data.amount / 100,
        paymentStatus: "paid",
      });

      await sendEmail({
        to: user.email,
        subject: "Welcome to StackMentor! 🎉",
        text: `Hi ${user.fullName}, your registration and payment were successful! You can now access your course.`,
      });
    }

    // Return JWT to frontend for immediate login
    const token = generateToken(user._id);

    // Determine learning page redirect
    let redirectUrl = "http://localhost:5173/learning-materials"; // full stack default
    if (data.metadata.course === "frontend")
      redirectUrl = "http://localhost:5173/learning-materials-frontend";
    if (data.metadata.course === "backend")
      redirectUrl = "http://localhost:5173/learning-materials-backend";

    res.status(200).json({
      success: true,
      message: "Payment verified and user created",
      token,
      redirectUrl,
      course: data.metadata.course,
      paymentType: data.metadata.paymentType,
      paidAt: data.paid_at,
    });
  } catch (error) {
    console.error("Verification Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
});

export default router;
