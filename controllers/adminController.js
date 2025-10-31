import User from "../models/User.js";
import Payment from "../models/Payment.js";

// Get all users with pagination
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();

    // Active users (with valid access)
    const activeUsers = await User.countDocuments({
      isActive: true,
      $or: [
        { accessExpiresAt: null }, // Full payment users
        { accessExpiresAt: { $gt: new Date() } }, // Part payment with valid access
      ],
    });

    // Expired users
    const expiredUsers = await User.countDocuments({
      accessExpiresAt: { $lt: new Date() },
    });

    // Total revenue
    const payments = await Payment.find({ status: "success" });
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Revenue this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const thisMonthPayments = await Payment.find({
      status: "success",
      createdAt: { $gte: startOfMonth },
    });
    const monthRevenue = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    // Course distribution
    const courseStats = await User.aggregate([
      { $group: { _id: "$course", count: { $sum: 1 } } },
    ]);

    // Payment type distribution
    const paymentTypeStats = await User.aggregate([
      { $group: { _id: "$paymentType", count: { $sum: 1 } } },
    ]);

    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    res.status(200).json({
      totalUsers,
      activeUsers,
      expiredUsers,
      totalRevenue,
      monthRevenue,
      courseStats,
      paymentTypeStats,
      recentUsers,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
};

// Get all payments
export const getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments();

    res.status(200).json({
      payments,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPayments: total,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's payment history
    const payments = await Payment.find({ email: user.email }).sort({ createdAt: -1 });

    res.status(200).json({ user, payments });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user details" });
  }
};

// Update user access
export const updateUserAccess = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, accessExpiresAt } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive, accessExpiresAt },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User access updated", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user access" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// Search users
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    const users = await User.find({
      $or: [
        { fullName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
      ],
    })
      .select("-password")
      .limit(20);

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
};