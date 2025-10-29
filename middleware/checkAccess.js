import User from "../models/User.js";

const checkAccess = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        message: "Account inactive",
        hasAccess: false 
      });
    }

    // Check if access has expired
    const now = new Date();
    if (user.accessExpiresAt && now > user.accessExpiresAt) {
      user.isActive = false;
      await user.save();
      
      return res.status(403).json({ 
        message: "Access expired. Please renew your subscription.",
        hasAccess: false,
        remainingAmount: user.remainingAmount
      });
    }

    // User has valid access
    req.userAccess = {
      hasAccess: true,
      course: user.course,
      expiresAt: user.accessExpiresAt,
      paymentType: user.paymentType
    };

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default checkAccess;