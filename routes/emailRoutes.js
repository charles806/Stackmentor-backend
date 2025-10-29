import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/send-mail", async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"StackMentor Bootcamp" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Email sent successfully ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send email ❌" });
  }
});

export default router;
