import { Notification } from "../models/Notification.js";
import { sendSms } from "./sms.js";

const formatAlertDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "today";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
};

const buildAbsentMessage = ({ studentName, courseTitle, className, date, markedBy }) => {
  const parts = [
    `Dear Parent/Student, ${studentName} was marked absent`,
    courseTitle ? `for ${courseTitle}` : "for class",
    className ? `(Class ${className})` : "",
    `on ${formatAlertDate(date)}.`,
    markedBy ? `Marked by ${markedBy}.` : ""
  ].filter(Boolean);

  return parts.join(" ").replace(/\s+/g, " ").trim();
};

export const sendAbsentAttendanceAlert = async ({ record, markedBy }) => {
  await record.populate([
    { path: "student", select: "name phone" },
    { path: "course", select: "title className" }
  ]);

  if (!record.student?._id) {
    return { notificationCreated: false, smsSent: false, skipped: true };
  }

  const title = "Absent Attendance Alert";
  const message = buildAbsentMessage({
    studentName: record.student.name || "Student",
    courseTitle: record.course?.title,
    className: record.course?.className,
    date: record.date,
    markedBy
  });

  await Notification.create({
    user: record.student._id,
    title,
    message,
    type: "attendance",
    meta: {
      scope: "attendance",
      attendanceId: record._id,
      courseId: record.course?._id || null,
      date: record.date
    }
  });

  let smsSent = false;
  try {
    const result = await sendSms({
      to: record.student.phone,
      message
    });
    smsSent = !result.skipped;
  } catch (error) {
    console.error("Attendance SMS delivery failed", error);
  }

  return { notificationCreated: true, smsSent, skipped: false };
};
