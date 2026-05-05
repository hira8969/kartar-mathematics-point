import { Exam } from "../models/Exam.js";
import { Result } from "../models/Result.js";

export const createExam = async (req, res) => {
  const exam = await Exam.create({
    ...req.body,
    createdBy: req.user._id
  });

  res.status(201).json(exam);
};

export const getExams = async (req, res) => {
  const filter = req.query.course ? { course: req.query.course } : {};
  const exams = await Exam.find(filter).populate("course", "title className").sort({ date: 1 });
  res.json(exams);
};

export const updateExam = async (req, res) => {
  const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(exam);
};

export const deleteExam = async (req, res) => {
  await Exam.findByIdAndDelete(req.params.id);
  res.json({ message: "Exam deleted" });
};

export const submitExam = async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  const answers = req.body.answers || {};

  let obtainedMarks = 0;
  exam.questions.forEach((question) => {
    const submitted = answers[question._id] || answers[String(question._id)];
    if (question.type === "mcq" && submitted?.trim() === question.correctAnswer) {
      obtainedMarks += question.marks;
    }
  });

  const result = await Result.findOneAndUpdate(
    { exam: req.params.id, student: req.user._id },
    { exam: req.params.id, student: req.user._id, answers, obtainedMarks, submittedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json(result);
};

export const getResults = async (req, res) => {
  const filter = req.user.role === "student" ? { student: req.user._id } : {};
  const results = await Result.find(filter)
    .populate("exam", "title totalMarks date resultPublished answerKeyPublished questions")
    .populate("student", "name studentClass");

  res.json(results);
};
