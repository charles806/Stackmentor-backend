import mongoose from "mongoose";

const courseContentSchema = new mongoose.Schema(
  {
    course: {
      type: String,
      enum: ["frontend", "backend", "fullstack"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["lesson", "note", "resource", "video", "assignment"],
      required: true,
    },
    content: {
      type: String, // Main content/text
    },
    videoUrl: {
      type: String, // YouTube/Vimeo link
    },
    fileUrl: {
      type: String, // Download link for PDFs, code files, etc.
    },
    order: {
      type: Number,
      default: 0, // For ordering content
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("CourseContent", courseContentSchema);