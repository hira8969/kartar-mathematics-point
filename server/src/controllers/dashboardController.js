import { Announcement } from "../models/Announcement.js";
import { Assignment } from "../models/Assignment.js";
import { Attendance } from "../models/Attendance.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { Exam } from "../models/Exam.js";
import { Submission } from "../models/Submission.js";

export const getStudentDashboard = async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id }).populate("course");
  const activeEnrollments = enrollments.filter((entry) => entry.course);
  const courseIds = activeEnrollments.map((entry) => entry.course._id);

  const [assignments, exams, announcements, submissions, attendance, courses] = await Promise.all([
    Assignment.find({ course: { $in: courseIds } }).sort({ dueDate: 1 }).limit(5),
    Exam.find({ course: { $in: courseIds } }).sort({ date: 1 }).limit(5),
    Announcement.find({
      $or: [{ scope: "global" }, { scope: "course", course: { $in: courseIds } }]
    }).sort({ createdAt: -1 }).limit(5),
    Submission.find({ student: req.user._id }).sort({ updatedAt: -1 }).limit(5),
    Attendance.find({ student: req.user._id }),
    Course.find({ _id: { $in: courseIds } }).select("title className batchName materials updatedAt")
  ]);

  const attendancePercent = attendance.length === 0
    ? 0
    : Math.round((attendance.filter((entry) => entry.status === "present").length / attendance.length) * 100);

  const recentMaterialUpdates = courses
    .flatMap((course) => (course.materials || []).map((material) => ({
      courseId: course._id,
      courseTitle: course.title,
      className: course.className,
      batchName: course.batchName,
      title: material.title,
      type: material.type,
      topic: material.topic,
      url: material.url,
      fileName: material.fileName,
      uploadedAt: material.uploadedAt || course.updatedAt
    })))
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    .slice(0, 5);

  res.json({
    welcome: `Welcome back, ${req.user.name}`,
    enrollments: activeEnrollments,
    upcomingAssignments: assignments,
    upcomingExams: exams,
    announcements,
    recentMaterialUpdates,
    recentSubmissions: submissions,
    attendancePercent
  });
};

export const getFacultyDashboard = async (req, res) => {
  const courses = await Course.find({ faculty: req.user._id });
  const courseIds = courses.map((course) => course._id);

  const [assignments, exams, submissions] = await Promise.all([
    Assignment.find({ course: { $in: courseIds } }),
    Exam.find({ course: { $in: courseIds }, date: { $gte: new Date() } }).sort({ date: 1 }).limit(5),
    Submission.find().populate({ path: "assignment", match: { course: { $in: courseIds } } })
  ]);

  res.json({
    courses,
    pendingToGrade: submissions.filter((submission) => submission.assignment && submission.marks === null).length,
    assignmentsCount: assignments.length,
    upcomingExams: exams
  });
};

export const getAdminDashboard = async (_req, res) => {
  const [enrollments, staffedCourses, courses, exams, announcements] = await Promise.all([
    Enrollment.countDocuments(),
    Course.countDocuments({ faculty: { $exists: true, $ne: [] } }),
    Course.countDocuments(),
    Exam.countDocuments(),
    Announcement.find().sort({ createdAt: -1 }).limit(5)
  ]);

  res.json({
    stats: { enrollments, staffedCourses, courses, exams },
    announcements
  });
};
