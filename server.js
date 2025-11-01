import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";

dotenv.config();
connectDB();

const app = express();

// ✅ FIXED CORS - Allow your frontend
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://stackmentorr.vercel.app",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api", emailRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/content", contentRoutes);

app.get("/", (req, res) => res.send("🚀 StackMentor API Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
