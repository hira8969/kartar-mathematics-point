import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    instructions: { type: String, default: "" },
    dueDate: { type: Date, required: true },
    maxMarks: { type: Number, default: 100 },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export const Assignment = mongoose.model("Assignment", assignmentSchema);
