import express from "express";
import {
  getCourseContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  getContentByCategory,
} from "../controllers/contentController.js";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public routes (protected - requires login)
router.get("/:course", protect, getCourseContent);
router.get("/:course/:category", protect, getContentByCategory);
router.get("/single/:id", protect, getContentById);

// Admin routes
router.post("/", protect, adminOnly, createContent);
router.put("/:id", protect, adminOnly, updateContent);
router.delete("/:id", protect, adminOnly, deleteContent);

export default router;