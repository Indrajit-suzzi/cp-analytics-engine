import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

/**
 * Standard rate limiter to prevent DDoS attacks and brute force.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: { message: "Too many requests, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter limiter for heavy analysis routes to preserve external API quota.
 */
const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Analysis limit reached. Please wait a while before checking more handles." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware for request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get("/api/health", generalLimiter, (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/user", analysisLimiter, userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});