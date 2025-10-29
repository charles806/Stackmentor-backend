import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";

export const registerUser = async (req, res) => {
  const { fullName, email, password, course } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      password: hashed,
      course: course?.toLowerCase() || "fullstack",
      paymentType: "full",
      amountPaid: 0,
      paymentStatus: "pending",
    });

    await sendEmail({
      to: email,
      subject: "Welcome to StackMentor",
      text: `Hi ${fullName},\n\nYour registration was successful. Please complete your payment to access course materials.\n\nBest regards,\nStackMentor Team`,
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        course: user.course,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check access status
    const now = new Date();
    const hasAccess =
      user.isActive && (!user.accessExpiresAt || now < user.accessExpiresAt);

    res.status(200).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        course: user.course,
        paymentType: user.paymentType,
        accessExpiresAt: user.accessExpiresAt,
        isActive: user.isActive,
        remainingAmount: user.remainingAmount,
      },
      hasAccess,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
