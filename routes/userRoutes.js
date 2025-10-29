import express from "express";
import { getAllUsers, getCurrentUser } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";
import checkAccess from "../middleware/checkAccess.js";

const router = express.Router();

// Get all users (admin route)
router.get("/", getAllUsers);

// Get current logged-in user with access check
router.get("/me", protect, getCurrentUser);

// Check if user has valid access
router.get("/check-access", protect, checkAccess, (req, res) => {
  res.json(req.userAccess);
});

export default router;