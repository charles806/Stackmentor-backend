import express from "express";
import {
  getAllUsers,
  getDashboardStats,
  getAllPayments,
  getUserById,
  updateUserAccess,
  deleteUser,
  searchUsers,
} from "../controllers/adminController.js";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(adminOnly);

// Dashboard statistics
router.get("/stats", getDashboardStats);

// Users management
router.get("/users", getAllUsers);
router.get("/users/search", searchUsers);
router.get("/users/:id", getUserById);
router.put("/users/:userId/access", updateUserAccess);
router.delete("/users/:id", deleteUser);

// Payments
router.get("/payments", getAllPayments);

export default router;