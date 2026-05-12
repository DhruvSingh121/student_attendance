import express from "express";
import { getAllNotifications, getMyNotifications, markAsRead } from "../controllers/notificationController.js";
import { authorize, protect } from "../middleware/Auth.middleware.js";

const router = express.Router();

router.get("/my", protect, authorize("student"), getMyNotifications);
router.get("/", protect, authorize("admin"), getAllNotifications);
router.patch("/:id/read", protect, markAsRead);

export default router;
