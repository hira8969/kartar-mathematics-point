import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    answers: { type: mongoose.Schema.Types.Mixed, default: {} },
    obtainedMarks: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

resultSchema.index({ exam: 1, student: 1 }, { unique: true });

export const Result = mongoose.model("Result", resultSchema);
