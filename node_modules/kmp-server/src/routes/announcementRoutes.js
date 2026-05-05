import express from "express";
import { createAnnouncement, getAnnouncements } from "../controllers/announcementController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getAnnouncements);
router.post("/", protect, authorize("faculty", "admin"), createAnnouncement);

export default router;
