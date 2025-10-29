import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users ❌" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if access has expired
    const now = new Date();
    const hasAccess =
      user.isActive && (!user.accessExpiresAt || now < user.accessExpiresAt);

    res.status(200).json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        course: user.course,
        paymentType: user.paymentType,
        amountPaid: user.amountPaid,
        paymentStatus: user.paymentStatus,
        paidAt: user.paidAt,
        accessExpiresAt: user.accessExpiresAt,
        isActive: user.isActive,
        remainingAmount: user.remainingAmount,
      },
      hasAccess,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user data" });
  }
};
