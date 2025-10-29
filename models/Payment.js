import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    course: String,
    paymentType: String,
    reference: { type: String, unique: true },
    amount: Number,
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
