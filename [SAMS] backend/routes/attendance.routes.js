import express from "express";
import {
  getAttendanceByClassAndDate,
  getMyAttendance,
  getStudentListForClass,
  markAttendance,
} from "../controllers/attendanceController.js";
import { authorize, protect } from "../middleware/Auth.middleware.js";

const router = express.Router();

router.get("/my", protect, authorize("student"), getMyAttendance);
router.get("/students", protect, authorize("teacher", "admin"), getStudentListForClass);
router.post("/mark", protect, authorize("teacher"), markAttendance);
router.get("/", protect, authorize("admin", "teacher"), getAttendanceByClassAndDate);

export default router;
