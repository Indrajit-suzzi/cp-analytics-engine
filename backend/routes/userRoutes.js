import express from "express";
import { getUserAnalytics } from "../controllers/userController.js";

const router = express.Router();

router.get("/:handle", getUserAnalytics);

export default router;
