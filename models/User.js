import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: String,
    password: { type: String, required: true },
    course: {
      type: String,
      enum: ["frontend", "backend", "fullstack"],
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["full", "part"],
      required: true,
    },
    amountPaid: { type: Number, required: true },
    paymentStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "paid", "partial"],
    },
    paidAt: { type: Date },
    accessExpiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
    remainingAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
