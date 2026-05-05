import { Attendance } from "../models/Attendance.js";
import { Course } from "../models/Course.js";
import { sendAbsentAttendanceAlert } from "../utils/attendanceAlerts.js";

export const markAttendance = async (req, res) => {
  const records = [];

  for (const entry of req.body.entries) {
    const previousRecord = await Attendance.findOne({
      course: req.body.course,
      student: entry.student,
      date: req.body.date
    }).select("status");

    const record = await Attendance.findOneAndUpdate(
      {
        course: req.body.course,
        student: entry.student,
        date: req.body.date
      },
      {
        course: req.body.course,
        student: entry.student,
        date: req.body.date,
        faculty: req.user._id,
        status: entry.status
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    records.push(record);

    if (entry.status === "absent" && previousRecord?.status !== "absent") {
      await sendAbsentAttendanceAlert({
        record,
        markedBy: req.user.name
      });
    }
  }

  res.status(201).json(records);
};

export const getCourseAttendanceForDate = async (req, res) => {
  const { courseId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: "Date is required" });
  }

  const course = await Course.findById(courseId).select("faculty");
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const isAdmin = req.user.role === "admin";
  const isAssignedFaculty = (course.faculty || []).some((facultyId) => facultyId.toString() === req.user._id.toString());
  if (!isAdmin && !isAssignedFaculty) {
    return res.status(403).json({ message: "You are not assigned to this course" });
  }

  const start = new Date(date);
  if (Number.isNaN(start.getTime())) {
    return res.status(400).json({ message: "Invalid date" });
  }

  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const records = await Attendance.find({
    course: courseId,
    date: { $gte: start, $lt: end }
  }).populate("student faculty", "name email phone studentClass");

  res.json(records);
};

export const updateAttendanceEntry = async (req, res) => {
  const record = await Attendance.findById(req.params.id);
  if (!record) {
    return res.status(404).json({ message: "Attendance record not found" });
  }

  const previousStatus = record.status;

  if (req.body.course) {
    record.course = req.body.course;
  }

  if (req.body.student) {
    record.student = req.body.student;
  }

  if (req.body.date) {
    const nextDate = new Date(req.body.date);
    if (!Number.isNaN(nextDate.getTime())) {
      record.date = nextDate;
    }
  }

  if (req.body.status) {
    record.status = req.body.status;
  }

  record.faculty = req.user._id;

  try {
    await record.save();
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: "An attendance record already exists for this student, course, and date" });
    }
    throw error;
  }

  await record.populate("student course faculty", "name title className");

  if (record.status === "absent" && previousStatus !== "absent") {
    await sendAbsentAttendanceAlert({
      record,
      markedBy: req.user.name
    });
  }

  res.json(record);
};

export const deleteAttendanceEntry = async (req, res) => {
  const record = await Attendance.findByIdAndDelete(req.params.id);
  if (!record) {
    return res.status(404).json({ message: "Attendance record not found" });
  }

  res.json({ message: "Attendance record deleted" });
};

export const getMyAttendance = async (req, res) => {
  const records = await Attendance.find({ student: req.user._id }).populate("course", "title className subject board batchName");
  const percentage =
    records.length === 0
      ? 0
      : Math.round((records.filter((record) => record.status === "present").length / records.length) * 100);

  const summaryMap = records.reduce((accumulator, record) => {
    const courseId = record.course?._id?.toString();
    if (!courseId) {
      return accumulator;
    }

    if (!accumulator[courseId]) {
      accumulator[courseId] = {
        courseId,
        course: record.course,
        totalSessions: 0,
        presentSessions: 0,
        percentage: 0,
        eligibleForCertificate: false
      };
    }

    accumulator[courseId].totalSessions += 1;
    if (record.status === "present") {
      accumulator[courseId].presentSessions += 1;
    }

    accumulator[courseId].percentage = Math.round(
      (accumulator[courseId].presentSessions / Math.max(accumulator[courseId].totalSessions, 1)) * 100
    );
    accumulator[courseId].eligibleForCertificate = accumulator[courseId].percentage >= 75;

    return accumulator;
  }, {});

  res.json({
    studentName: req.user.name,
    records,
    percentage,
    courseSummaries: Object.values(summaryMap).sort((a, b) => b.percentage - a.percentage)
  });
};
