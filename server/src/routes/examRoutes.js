import express from "express";
import {
  createExam,
  deleteExam,
  getExams,
  getResults,
  submitExam,
  updateExam
} from "../controllers/examController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getExams);
router.get("/results", protect, getResults);
router.post("/", protect, authorize("faculty", "admin"), createExam);
router.post("/:id/submit", protect, authorize("student"), submitExam);
router.put("/:id", protect, authorize("faculty", "admin"), updateExam);
router.delete("/:id", protect, authorize("admin"), deleteExam);

export default router;
