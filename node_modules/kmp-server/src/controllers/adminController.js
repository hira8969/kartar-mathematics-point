import { Attendance } from "../models/Attendance.js";
import { Assignment } from "../models/Assignment.js";
import { Course } from "../models/Course.js";
import { Exam } from "../models/Exam.js";
import { Submission } from "../models/Submission.js";
import { User } from "../models/User.js";
import { Enrollment } from "../models/Enrollment.js";
import { Announcement } from "../models/Announcement.js";
import { ROLES } from "../constants.js";
import { applyInstituteSettingsUpdate, getInstituteBranding } from "../utils/instituteSettings.js";

const normalizeSubjects = (subjectsTaught) => {
  if (Array.isArray(subjectsTaught)) {
    return subjectsTaught.map((item) => item.trim()).filter(Boolean);
  }

  if (typeof subjectsTaught === "string") {
    return subjectsTaught.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
};

const normalizeEmail = (email) => {
  const value = email?.trim();
  return value ? value.toLowerCase() : undefined;
};

const normalizePhone = (phone) => {
  const value = phone?.trim();
  return value || undefined;
};

export const getAdminOverview = async (_req, res) => {
  const [students, faculty, courses, exams, assignments, submissions, attendance] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "faculty" }),
    Course.countDocuments(),
    Exam.countDocuments(),
    Assignment.countDocuments(),
    Submission.countDocuments(),
    Attendance.countDocuments()
  ]);

  res.json({
    stats: { students, faculty, courses, exams, assignments, submissions, attendance }
  });
};

export const getUsers = async (_req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
};

export const createUser = async (req, res) => {
  const role = req.body.role || ROLES.STUDENT;
  const name = req.body.name?.trim();
  const email = normalizeEmail(req.body.email);
  const phone = normalizePhone(req.body.phone);
  const password = req.body.password;
  const studentClass = role === ROLES.STUDENT ? req.body.studentClass?.trim() || "" : "";
  const subjectsTaught = role === ROLES.FACULTY ? normalizeSubjects(req.body.subjectsTaught) : [];

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  if (![ROLES.STUDENT, ROLES.FACULTY, ROLES.ADMIN].includes(role)) {
    return res.status(400).json({ message: "Invalid user role" });
  }

  const filters = [{ email }];
  if (phone) filters.push({ phone });

  const existingUser = await User.findOne({ $or: filters });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists with this email or phone" });
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
    studentClass,
    subjectsTaught,
    isApproved: true,
    isSuspended: false
  });

  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    studentClass: user.studentClass,
    subjectsTaught: user.subjectsTaught
  });
};

export const updateUserStatus = async (req, res) => {
  const existingUser = await User.findById(req.params.id);
  if (!existingUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const role = req.body.role || existingUser.role;
  if (![ROLES.STUDENT, ROLES.FACULTY, ROLES.ADMIN].includes(role)) {
    return res.status(400).json({ message: "Invalid user role" });
  }

  const name = req.body.name !== undefined ? req.body.name?.trim() : existingUser.name;
  const email = req.body.email !== undefined ? normalizeEmail(req.body.email) : existingUser.email;
  const phone = req.body.phone !== undefined ? normalizePhone(req.body.phone) : existingUser.phone;
  const studentClass = role === ROLES.STUDENT
    ? (req.body.studentClass !== undefined ? req.body.studentClass?.trim() || "" : existingUser.studentClass)
    : "";
  const subjectsTaught = role === ROLES.FACULTY
    ? (req.body.subjectsTaught !== undefined ? normalizeSubjects(req.body.subjectsTaught) : existingUser.subjectsTaught)
    : [];

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  const duplicateFilters = [{ email }];
  if (phone) duplicateFilters.push({ phone });

  const duplicateUser = await User.findOne({
    _id: { $ne: req.params.id },
    $or: duplicateFilters
  });

  if (duplicateUser) {
    return res.status(400).json({ message: "Another user already uses this email or phone" });
  }

  existingUser.name = name;
  existingUser.email = email;
  existingUser.phone = phone;
  existingUser.role = role;
  existingUser.studentClass = studentClass;
  existingUser.subjectsTaught = subjectsTaught;

  if (req.body.isSuspended !== undefined) {
    existingUser.isSuspended = req.body.isSuspended;
  }

  if (req.body.isApproved !== undefined) {
    existingUser.isApproved = req.body.isApproved;
  }

  await existingUser.save();

  res.json({
    _id: existingUser._id,
    name: existingUser.name,
    email: existingUser.email,
    phone: existingUser.phone,
    role: existingUser.role,
    studentClass: existingUser.studentClass,
    subjectsTaught: existingUser.subjectsTaught,
    isApproved: existingUser.isApproved,
    isSuspended: existingUser.isSuspended,
    createdAt: existingUser.createdAt,
    updatedAt: existingUser.updatedAt
  });
};

export const bulkApproveUsers = async (req, res) => {
  const userIds = Array.isArray(req.body.userIds) ? req.body.userIds.filter(Boolean) : [];

  if (!userIds.length) {
    return res.status(400).json({ message: "Select at least one user" });
  }

  const result = await User.updateMany(
    { _id: { $in: userIds } },
    { isApproved: true, isSuspended: false }
  );

  res.json({ message: "Users approved", matched: result.matchedCount, modified: result.modifiedCount });
};

export const bulkDeleteUsers = async (req, res) => {
  const userIds = Array.isArray(req.body.userIds) ? req.body.userIds.filter(Boolean) : [];

  if (!userIds.length) {
    return res.status(400).json({ message: "Select at least one user" });
  }

  const result = await User.deleteMany({ _id: { $in: userIds } });
  res.json({ message: "Users deleted", deleted: result.deletedCount });
};

export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User removed" });
};

export const getReports = async (_req, res) => {
  const [enrollments, results, attendance, announcements, courses, students] = await Promise.all([
    Enrollment.find().populate("student course", "name title className").sort({ createdAt: -1 }),
    Submission.find().populate("student assignment", "name title").sort({ createdAt: -1 }),
    Attendance.find().populate("student course faculty", "name title").sort({ date: -1, createdAt: -1 }),
    Announcement.find().sort({ createdAt: -1 }).limit(10),
    Course.find().sort({ createdAt: -1 }),
    User.find({ role: ROLES.STUDENT }).select("name email phone studentClass").sort({ name: 1 })
  ]);

  res.json({
    enrollments: enrollments.filter((entry) => entry.student && entry.course),
    results,
    attendance: attendance.filter((entry) => entry.student && entry.course),
    announcements,
    courses,
    students
  });
};

export const getInstituteSettings = async (_req, res) => {
  res.json(await getInstituteBranding());
};

export const updateInstituteSettings = async (req, res) => {
  try {
    const settings = await applyInstituteSettingsUpdate(req.body);
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message || "Unable to save institute settings" });
  }
};
