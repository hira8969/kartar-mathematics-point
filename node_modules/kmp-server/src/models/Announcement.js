import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    scope: { type: String, enum: ["global", "course"], default: "global" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export const Announcement = mongoose.model("Announcement", announcementSchema);
