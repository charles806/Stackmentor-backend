import Certificate from "../models/Certificate.js";
import User from "../models/User.js";

// Generate certificate for user
export const generateCertificate = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if certificate already exists
    let certificate = await Certificate.findOne({ userId });

    if (certificate) {
      return res.status(200).json({
        message: "Certificate already exists",
        certificate,
      });
    }

    // Create new certificate
    certificate = await Certificate.create({
      userId,
      userName: user.fullName,
      course: user.course,
      completionPercentage: 100,
    });

    res.status(201).json({
      message: "Certificate generated successfully",
      certificate,
    });
  } catch (error) {
    console.error("Certificate generation error:", error);
    res.status(500).json({ error: "Failed to generate certificate" });
  }
};

// Get user's certificate
export const getUserCertificate = async (req, res) => {
  try {
    const userId = req.user._id;

    const certificate = await Certificate.findOne({ userId }).populate(
      "userId",
      "fullName email course"
    );

    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    res.status(200).json({ certificate });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch certificate" });
  }
};

// Verify certificate by number (public)
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateNumber } = req.params;

    const certificate = await Certificate.findOne({ certificateNumber }).populate(
      "userId",
      "fullName email"
    );

    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    res.status(200).json({
      valid: true,
      certificate: {
        userName: certificate.userName,
        course: certificate.course,
        issuedDate: certificate.issuedDate,
        certificateNumber: certificate.certificateNumber,
        isVerified: certificate.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify certificate" });
  }
};

// Get all certificates (Admin only)
export const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ certificates });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
};