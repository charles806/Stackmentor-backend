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

// Helper function to calculate expiration date
const calculateExpirationDate = (paymentType, course) => {
  if (paymentType === "full") {
    return null; // Full payment = unlimited access
  }

  // Part payment expiration
  const monthsToAdd = course === "fullstack" ? 4 : 2;
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd);
  return expiryDate;
};

// Helper function to calculate remaining amount
const calculateRemainingAmount = (paymentType, course) => {
  if (paymentType === "full") return 0;

  const prices = {
    frontend: { part: 20000 },
    backend: { part: 28000 },
    fullstack: { part: 40000 },
  };

  return prices[course]?.part || 0;
};

// ======================
// INITIALIZE PAYMENT
// ======================
router.post("/initialize", async (req, res) => {
  const { fullName, email, phone, course, paymentType, amount, password } =
    req.body;

  try {
    // Normalize course name to lowercase
    const normalizedCourse = course.toLowerCase();

    // ✅ Use environment variable for callback URL
    const frontendUrl =
      process.env.FRONTEND_URL || "https://stackmentor.vercel.app";

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        callback_url: `/payment-success`, // ✅ FIXED - Use frontend URL
        metadata: {
          fullName,
          email,
          phone,
          course: normalizedCourse,
          paymentType,
          password,
        },
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
      return res.status(400).json({
        success: false,
        message: "Payment failed",
      });
    }

    const metadata = data.metadata;
    const normalizedCourse = metadata.course.toLowerCase();

    // Save payment record
    let payment = await Payment.findOne({ reference });
    if (!payment) {
      payment = await Payment.create({
        name: metadata.fullName,
        email: metadata.email,
        course: normalizedCourse,
        paymentType: metadata.paymentType,
        reference,
        amount: data.amount / 100,
        status: "success",
      });
    }

    // Calculate expiration and remaining amount
    const accessExpiresAt = calculateExpirationDate(
      metadata.paymentType,
      normalizedCourse
    );
    const remainingAmount = calculateRemainingAmount(
      metadata.paymentType,
      normalizedCourse
    );

    // Create or update user
    let user = await User.findOne({ email: metadata.email });

    if (!user) {
      const hashedPassword = await bcrypt.hash(metadata.password, 10);
      user = await User.create({
        fullName: metadata.fullName,
        email: metadata.email,
        phone: metadata.phone,
        password: hashedPassword,
        course: normalizedCourse,
        paymentType: metadata.paymentType,
        amountPaid: data.amount / 100,
        paymentStatus: metadata.paymentType === "full" ? "paid" : "partial",
        paidAt: new Date(),
        accessExpiresAt,
        isActive: true,
        remainingAmount,
      });

      // Send welcome email
      await sendEmail({
        to: user.email,
        subject: "Welcome to StackMentor! 🎉",
        text: `Hi ${
          user.fullName
        },\n\nYour registration and payment were successful! You can now access your ${normalizedCourse} course.\n\n${
          metadata.paymentType === "part"
            ? `Remaining balance: ₦${remainingAmount}\nAccess expires: ${accessExpiresAt?.toDateString()}\n\n`
            : "You have unlimited access!\n\n"
        }Login at: https://stackmentor.vercel.app/login\n\nHappy Learning!\nStackMentor Team`,
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // ✅ Use environment variable for redirect URLs
    const frontendUrl =
      process.env.FRONTEND_URL || "https://stackmentor.vercel.app";

    // Determine redirect URL based on course
    const redirectUrls = {
      frontend: `/learning-materials-frontend`,
      backend: `/learning-materials-backend`,
      fullstack: `/learning-materials`,
    };

    const redirectUrl = redirectUrls[normalizedCourse] || `/learning-materials`;

    res.status(200).json({
      success: true,
      message: "Payment verified and user created",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        course: user.course,
        paymentType: user.paymentType,
        accessExpiresAt: user.accessExpiresAt,
        remainingAmount: user.remainingAmount,
        isActive: user.isActive,
      },
      redirectUrl,
    });
  } catch (error) {
    console.error("Verification Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
});

export default router;
