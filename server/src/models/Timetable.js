import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    dayOfWeek: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String, default: "" },
    notes: { type: String, default: "" },
    subject: { type: String, default: "Mathematics" },
    className: { type: String, default: "" },
    batchName: { type: String, default: "" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    audienceRoles: {
      type: [String],
      enum: ["student", "faculty"],
      default: ["student", "faculty"]
    },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Timetable = mongoose.model("Timetable", timetableSchema);
