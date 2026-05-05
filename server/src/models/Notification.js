import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ["announcement", "attendance"], default: "announcement" },
    isRead: { type: Boolean, default: false },
    meta: {
      announcementId: { type: mongoose.Schema.Types.ObjectId, ref: "Announcement", default: null },
      scope: { type: String, default: "global" },
      attendanceId: { type: mongoose.Schema.Types.ObjectId, ref: "Attendance", default: null },
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
      date: { type: Date, default: null }
    }
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
