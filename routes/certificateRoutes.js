import express from "express";
import {
  generateCertificate,
  getUserCertificate,
  verifyCertificate,
  getAllCertificates,
} from "../controllers/certificateController.js";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// User routes
router.post("/generate", protect, generateCertificate);
router.get("/my-certificate", protect, getUserCertificate);

// Public route
router.get("/verify/:certificateNumber", verifyCertificate);

// Admin routes
router.get("/all", protect, adminOnly, getAllCertificates);

export default router;