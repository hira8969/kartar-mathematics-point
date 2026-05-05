import express from "express";
import {
  createAssignment,
  getAssignments,
  getSubmissions,
  gradeSubmission,
  submitAssignment,
  updateAssignment
} from "../controllers/assignmentController.js";
import { authorize, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", protect, getAssignments);
router.get("/submissions", protect, authorize("faculty", "admin"), getSubmissions);
router.post("/", protect, authorize("faculty", "admin"), createAssignment);
router.put("/:id", protect, authorize("faculty", "admin"), updateAssignment);
router.post("/:id/submit", protect, authorize("student"), upload.single("file"), submitAssignment);
router.put("/submissions/:id/grade", protect, authorize("faculty", "admin"), gradeSubmission);

export default router;
