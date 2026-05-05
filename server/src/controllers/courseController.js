import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { Timetable } from "../models/Timetable.js";

const attachEnrollmentDetails = async (courses) => {
  const courseIds = courses.map((course) => course._id);
  const enrollments = await Enrollment.find({ course: { $in: courseIds }, status: "approved" })
    .populate("student", "name email phone studentClass")
    .sort({ createdAt: 1 });

  const studentsByCourse = enrollments.reduce((accumulator, enrollment) => {
    if (!enrollment.course || !enrollment.student) {
      return accumulator;
    }

    const courseId = enrollment.course.toString();
    if (!accumulator[courseId]) {
      accumulator[courseId] = [];
    }

    accumulator[courseId].push({
      _id: enrollment.student._id,
      name: enrollment.student.name,
      email: enrollment.student.email,
      phone: enrollment.student.phone,
      studentClass: enrollment.student.studentClass,
      enrollmentId: enrollment._id
    });

    return accumulator;
  }, {});

  return courses.map((course) => {
    const enrolledStudents = (studentsByCourse[course._id.toString()] || []).sort((a, b) => a.name.localeCompare(b.name));
    return {
      ...course.toObject(),
      enrolledStudents,
      enrolledCount: enrolledStudents.length
    };
  });
};

export const getCourses = async (req, res) => {
  const courses = await Course.find().populate("faculty", "name email phone subjectsTaught");

  if (["admin", "faculty"].includes(req.user.role)) {
    return res.json(await attachEnrollmentDetails(courses));
  }

  res.json(courses);
};

export const getFacultyAttendanceCourses = async (req, res) => {
  const courses = await Course.find({ faculty: req.user._id, isActive: true })
    .populate("faculty", "name email phone subjectsTaught")
    .sort({ createdAt: -1 });

  res.json(await attachEnrollmentDetails(courses));
};

export const getCourseById = async (req, res) => {
  const course = await Course.findById(req.params.id).populate("faculty", "name email phone");
  res.json(course);
};

export const createCourse = async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json(course);
};

export const updateCourse = async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(course);
};

export const deleteCourse = async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  await Promise.all([
    Enrollment.deleteMany({ course: req.params.id }),
    Timetable.deleteMany({ course: req.params.id })
  ]);
  res.json({ message: "Course deleted" });
};

export const enrollInCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const enrollment = await Enrollment.findOneAndUpdate(
    { student: req.user._id, course: req.params.id },
    { status: "approved" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate("course");

  res.status(201).json(enrollment);
};

export const getMyEnrollments = async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id }).populate("course");
  res.json(enrollments.filter((entry) => entry.course));
};

export const addCourseMaterial = async (req, res) => {
  const course = await Course.findById(req.params.id);
  course.materials.push({
    title: req.body.title,
    type: req.body.type || (req.file ? "pdf" : "note"),
    url: req.body.url || (req.file ? `/uploads/${req.file.filename}` : ""),
    fileName: req.file?.originalname || req.body.fileName || "",
    topic: req.body.topic || "",
    uploadedAt: new Date()
  });
  await course.save();
  res.status(201).json(course);
};

