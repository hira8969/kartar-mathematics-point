import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["mcq", "subjective"], default: "mcq" },
    prompt: { type: String, required: true },
    options: { type: [String], default: [] },
    correctAnswer: { type: String, default: "" },
    marks: { type: Number, default: 1 }
  },
  { _id: true }
);

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    questions: { type: [questionSchema], default: [] },
    answerKeyPublished: { type: Boolean, default: false },
    resultPublished: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Exam = mongoose.model("Exam", examSchema);
