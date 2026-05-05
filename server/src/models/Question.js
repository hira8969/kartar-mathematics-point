import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    type: { type: String, enum: ["mcq", "subjective"], default: "mcq" },
    prompt: { type: String, required: true },
    options: { type: [String], default: [] },
    correctAnswer: { type: String, default: "" },
    marks: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export const Question = mongoose.model("Question", questionSchema);
