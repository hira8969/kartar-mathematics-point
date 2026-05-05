import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["pdf", "video", "note"], default: "note" },
    url: { type: String, default: "" },
    fileName: { type: String, default: "" },
    topic: { type: String, default: "" },
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    className: { type: String, required: true },
    subject: { type: String, default: "Mathematics" },
    board: { type: String, default: "Bihar Board" },
    syllabus: { type: String, default: "" },
    fee: { type: Number, default: 0 },
    batchName: { type: String, default: "" },
    faculty: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    materials: { type: [materialSchema], default: [] },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);


