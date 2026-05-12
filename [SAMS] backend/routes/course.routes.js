import express from "express";
import { createCourse, deleteCourse, getAllCourses, getCourseById, updateCourse } from "../controllers/courseController.js";
import { authorize, protect } from "../middleware/Auth.middleware.js";

const router = express.Router();

router.get("/", protect, getAllCourses);
router.post("/", protect, authorize("admin"), createCourse);
router.get("/:id", protect, getCourseById);
router.put("/:id", protect, authorize("admin"), updateCourse);
router.delete("/:id", protect, authorize("admin"), deleteCourse);

export default router;
