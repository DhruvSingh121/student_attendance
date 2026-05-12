import express from "express";
import {
  createUser,
  deleteUser,
  getAllStudents,
  getAllTeachers,
  getAllUsers,
  getDashboardStats,
  getUserById,
  updateUser,
} from "../controllers/userController.js";
import { authorize, protect } from "../middleware/Auth.middleware.js";

const router = express.Router();

router.get("/dashboard-stats", protect, authorize("admin"), getDashboardStats);
router.get("/students", protect, authorize("admin", "teacher"), getAllStudents);
router.get("/teachers", protect, authorize("admin"), getAllTeachers);
router.get("/", protect, authorize("admin"), getAllUsers);
router.post("/", protect, authorize("admin"), createUser);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, authorize("admin"), updateUser);
router.delete("/:id", protect, authorize("admin"), deleteUser);

export default router;
