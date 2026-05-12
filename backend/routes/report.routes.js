import express from "express";
import { getClassReport, getWeeklyReport } from "../controllers/reportController.js";
import { authorize, protect } from "../middleware/Auth.middleware.js";

const router = express.Router();

router.get("/class", protect, authorize("admin", "teacher"), getClassReport);
router.get("/weekly", protect, authorize("admin", "teacher"), getWeeklyReport);

export default router;
