import express from "express";
import {
  addCourseMaterial,
  createCourse,
  deleteCourse,
  enrollInCourse,
  getCourseById,
  getCourses,
  getFacultyAttendanceCourses,
  getMyEnrollments,
  updateCourse
} from "../controllers/courseController.js";
import { authorize, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", protect, getCourses);
router.get("/faculty/attendance", protect, authorize("faculty"), getFacultyAttendanceCourses);
router.get("/enrollments/me", protect, authorize("student"), getMyEnrollments);
router.get("/:id", protect, getCourseById);
router.post("/", protect, authorize("admin"), createCourse);
router.post("/:id/enroll", protect, authorize("student"), enrollInCourse);
router.post("/:id/materials", protect, authorize("faculty", "admin"), upload.single("file"), addCourseMaterial);
router.put("/:id", protect, authorize("admin"), updateCourse);
router.delete("/:id", protect, authorize("admin"), deleteCourse);

export default router;
