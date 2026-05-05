import mongoose from "mongoose";
import { Assignment } from "../models/Assignment.js";
import { Submission } from "../models/Submission.js";

const validateAssignmentPayload = ({ title, dueDate, course }) => {
  if (!title?.trim()) {
    return "Assignment title is required";
  }

  if (!course || !mongoose.Types.ObjectId.isValid(course)) {
    return "A valid course is required";
  }

  if (!dueDate) {
    return "Due date is required";
  }

  return "";
};

export const createAssignment = async (req, res) => {
  try {
    const { title, instructions, dueDate, maxMarks, course } = req.body;
    const validationMessage = validateAssignmentPayload({ title, dueDate, course });

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const assignment = await Assignment.create({
      title: title.trim(),
      instructions: instructions?.trim() || "",
      dueDate,
      maxMarks: Number(maxMarks) || 100,
      course,
      createdBy: req.user._id
    });

    return res.status(201).json(assignment);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to create assignment" });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const { title, instructions, dueDate, maxMarks, course } = req.body;
    const validationMessage = validateAssignmentPayload({ title, dueDate, course });

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    assignment.title = title.trim();
    assignment.instructions = instructions?.trim() || "";
    assignment.dueDate = dueDate;
    assignment.maxMarks = Number(maxMarks) || 100;
    assignment.course = course;

    await assignment.save();

    return res.json(assignment);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to update assignment" });
  }
};

export const getAssignments = async (req, res) => {
  const filter = req.query.course ? { course: req.query.course } : {};
  const assignments = await Assignment.find(filter).populate("course", "title className");
  res.json(assignments);
};

export const submitAssignment = async (req, res) => {
  const payload = {
    assignment: req.params.id,
    student: req.user._id,
    textAnswer: req.body.textAnswer || "",
    fileUrl: req.file ? `/uploads/${req.file.filename}` : "",
    fileName: req.file?.originalname || ""
  };

  const submission = await Submission.findOneAndUpdate(
    { assignment: req.params.id, student: req.user._id },
    payload,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json(submission);
};

export const getSubmissions = async (req, res) => {
  const filter = req.query.assignment ? { assignment: req.query.assignment } : {};
  const submissions = await Submission.find(filter)
    .populate("student", "name phone studentClass")
    .populate("assignment", "title dueDate maxMarks course");

  res.json(submissions);
};

export const gradeSubmission = async (req, res) => {
  const submission = await Submission.findByIdAndUpdate(
    req.params.id,
    { ...req.body, gradedAt: new Date() },
    { new: true }
  );

  res.json(submission);
};
