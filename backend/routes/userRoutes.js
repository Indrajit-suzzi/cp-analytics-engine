import express from "express";
import { getUserAnalytics } from "../controllers/userController.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(400).json({ message: "Handle is required" });
});

router.get("/:handle", getUserAnalytics);

export default router;
