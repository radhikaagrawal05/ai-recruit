import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import path from "path";

import { env } from "./shared/config/env";
import { logger, morganMiddleware } from "./infrastructure/logger";
import { errorHandler } from "./shared/middleware/errorHandler";

// Route imports
import authRoutes from "./modules/auth/presentation/routes/authRoutes";
import jobRoutes from "./modules/jobs/presentation/routes/jobRoutes";
import candidateRoutes from "./modules/candidates/presentation/routes/candidateRoutes";
import resumeRoutes from "./modules/resume/presentation/routes/resumeRoutes";
import interviewRoutes from "./modules/interview/presentation/routes/interviewRoutes";

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(morganMiddleware);

// Serve uploaded files (local storage)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interviews", interviewRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handler (must be last)
app.use(errorHandler);

// Database connection + server start
mongoose.connect(env.MONGO_URI).then(() => {
  logger.info("✅ MongoDB connected");
  app.listen(parseInt(env.PORT), () => {
    logger.info(`✅ Server running on port ${env.PORT}`);
  });
}).catch((err) => {
  logger.error("❌ MongoDB connection failed:", err.message);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Shutting down gracefully...");
  await mongoose.disconnect();
  process.exit(0);
});