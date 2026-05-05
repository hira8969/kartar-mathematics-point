import express from "express";
import {
  createTimetable,
  deleteTimetable,
  getAdminTimetables,
  getMyTimetable,
  getTimetableBranding,
  reorderTimetables,
  updateTimetable
} from "../controllers/timetableController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/branding", protect, authorize("student", "faculty", "admin"), getTimetableBranding);
router.get("/mine", protect, authorize("student", "faculty"), getMyTimetable);
router.get("/", protect, authorize("admin"), getAdminTimetables);
router.post("/", protect, authorize("admin"), createTimetable);
router.patch("/reorder", protect, authorize("admin"), reorderTimetables);
router.patch("/:id", protect, authorize("admin"), updateTimetable);
router.delete("/:id", protect, authorize("admin"), deleteTimetable);

export default router;
