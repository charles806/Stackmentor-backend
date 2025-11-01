import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    course: {
      type: String,
      enum: ["frontend", "backend", "fullstack"],
      required: true,
    },
    certificateNumber: {
      type: String,
      unique: true,
      required: true,
    },
    issuedDate: {
      type: Date,
      default: Date.now,
    },
    completionPercentage: {
      type: Number,
      default: 100,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Generate certificate number before saving
certificateSchema.pre("save", async function (next) {
  if (!this.certificateNumber) {
    const count = await mongoose.models.Certificate.countDocuments();
    const year = new Date().getFullYear();
    this.certificateNumber = `SM-${year}-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

export default mongoose.model("Certificate", certificateSchema);
