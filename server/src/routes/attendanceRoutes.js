import express from "express";
import { deleteAttendanceEntry, getCourseAttendanceForDate, getMyAttendance, markAttendance, updateAttendanceEntry } from "../controllers/attendanceController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", protect, authorize("student"), getMyAttendance);
router.get("/course/:courseId", protect, authorize("faculty", "admin"), getCourseAttendanceForDate);
router.post("/", protect, authorize("faculty", "admin"), markAttendance);
router.patch("/:id", protect, authorize("admin"), updateAttendanceEntry);
router.delete("/:id", protect, authorize("admin"), deleteAttendanceEntry);

export default router;
