import express from "express";
import { createClass, deleteClass, getAllClasses, getMyClasses, updateClass } from "../controllers/classController.js";
import { authorize, protect } from "../middleware/Auth.middleware.js";

const router = express.Router();

router.get("/my", protect, authorize("teacher"), getMyClasses);
router.get("/", protect, getAllClasses);
router.post("/", protect, authorize("admin"), createClass);
router.put("/:id", protect, authorize("admin"), updateClass);
router.delete("/:id", protect, authorize("admin"), deleteClass);

export default router;
