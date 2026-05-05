import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { Timetable } from "../models/Timetable.js";
import { getInstituteBranding } from "../utils/instituteSettings.js";

const populateTimetable = (query) => query.populate("course", "title subject className batchName").populate("faculty", "name email phone");

const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const timeToMinutes = (value) => {
  const [hours, minutes] = String(value || "").split(":").map(Number);
  return (hours * 60) + minutes;
};

const rangesOverlap = (startA, endA, startB, endB) => startA < endB && startB < endA;

const sortTimetable = (items) => {
  return [...items].sort((a, b) => {
    const dayDiff = dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
    if (dayDiff !== 0) return dayDiff;
    const orderDiff = (a.displayOrder || 0) - (b.displayOrder || 0);
    if (orderDiff !== 0) return orderDiff;
    return String(a.startTime).localeCompare(String(b.startTime));
  });
};

const getNextDisplayOrder = async (dayOfWeek) => {
  const last = await Timetable.findOne({ dayOfWeek }).sort({ displayOrder: -1 }).select("displayOrder");
  return (last?.displayOrder || 0) + 1;
};

const validateTimeWindow = (startTime, endTime) => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
    return "End time must be later than start time";
  }
  return "";
};

const findEntryConflicts = (candidate, entries) => {
  const candidateStart = timeToMinutes(candidate.startTime);
  const candidateEnd = timeToMinutes(candidate.endTime);

  return entries.reduce((messages, entry) => {
    if (!entry?.isActive || entry._id?.toString() === candidate._id?.toString()) {
      return messages;
    }

    if (entry.dayOfWeek !== candidate.dayOfWeek) {
      return messages;
    }

    const entryStart = timeToMinutes(entry.startTime);
    const entryEnd = timeToMinutes(entry.endTime);
    if (!rangesOverlap(candidateStart, candidateEnd, entryStart, entryEnd)) {
      return messages;
    }

    if (candidate.faculty && entry.faculty && entry.faculty.toString() === candidate.faculty.toString()) {
      messages.push(`Faculty conflict with \"${entry.title}\" on ${entry.dayOfWeek} (${entry.startTime}-${entry.endTime})`);
    }

    if (candidate.room && entry.room && entry.room.trim() && entry.room.trim().toLowerCase() === candidate.room.trim().toLowerCase()) {
      messages.push(`Room conflict in \"${entry.room}\" with \"${entry.title}\" on ${entry.dayOfWeek} (${entry.startTime}-${entry.endTime})`);
    }

    return messages;
  }, []);
};

const assertTimetableConflicts = async (candidate, excludeId = "") => {
  if (!candidate.isActive) {
    return;
  }

  const timeError = validateTimeWindow(candidate.startTime, candidate.endTime);
  if (timeError) {
    const error = new Error(timeError);
    error.statusCode = 400;
    throw error;
  }

  const conditions = [];
  if (candidate.faculty) conditions.push({ faculty: candidate.faculty });
  if (candidate.room?.trim()) conditions.push({ room: new RegExp(`^${candidate.room.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") });
  if (!conditions.length) {
    return;
  }

  const existing = await Timetable.find({
    _id: excludeId ? { $ne: excludeId } : { $exists: true },
    isActive: true,
    dayOfWeek: candidate.dayOfWeek,
    $or: conditions
  });

  const conflicts = findEntryConflicts(candidate, existing);
  if (conflicts.length) {
    const error = new Error(conflicts.join(" | "));
    error.statusCode = 400;
    throw error;
  }
};

const assertReorderConflicts = async (items) => {
  const ids = items.map((item) => item.id);
  const allActive = await Timetable.find({ isActive: true });
  const updates = new Map(items.map((item, index) => [String(item.id), { dayOfWeek: item.dayOfWeek, displayOrder: item.displayOrder ?? index + 1 }]));
  const simulated = allActive.map((entry) => {
    const update = updates.get(String(entry._id));
    return update ? { ...entry.toObject(), ...update } : entry.toObject();
  });

  for (let i = 0; i < simulated.length; i += 1) {
    const current = simulated[i];
    if (!ids.includes(String(current._id))) continue;
    const conflicts = findEntryConflicts(current, simulated.filter((_, index) => index !== i));
    if (conflicts.length) {
      const error = new Error(conflicts[0]);
      error.statusCode = 400;
      throw error;
    }
  }
};

export const getTimetableBranding = async (_req, res) => {
  res.json(await getInstituteBranding());
};

export const getAdminTimetables = async (_req, res) => {
  const items = await populateTimetable(Timetable.find()).sort({ dayOfWeek: 1, displayOrder: 1, startTime: 1 });
  res.json(sortTimetable(items));
};

export const createTimetable = async (req, res) => {
  const dayOfWeek = req.body.dayOfWeek;
  const payload = {
    title: req.body.title?.trim(),
    dayOfWeek,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    room: req.body.room?.trim() || "",
    notes: req.body.notes?.trim() || "",
    subject: req.body.subject?.trim() || "Mathematics",
    className: req.body.className?.trim() || "",
    batchName: req.body.batchName?.trim() || "",
    course: req.body.course || null,
    faculty: req.body.faculty || null,
    audienceRoles: Array.isArray(req.body.audienceRoles) && req.body.audienceRoles.length ? req.body.audienceRoles : ["student", "faculty"],
    displayOrder: req.body.displayOrder ?? await getNextDisplayOrder(dayOfWeek),
    isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true
  };

  try {
    await assertTimetableConflicts(payload);
  } catch (error) {
    return res.status(error.statusCode || 400).json({ message: error.message || "Timetable conflict detected" });
  }

  const timetable = await Timetable.create(payload);
  await timetable.populate("course", "title subject className batchName");
  await timetable.populate("faculty", "name email phone");
  res.status(201).json(timetable);
};

export const updateTimetable = async (req, res) => {
  const timetable = await Timetable.findById(req.params.id);
  if (!timetable) {
    return res.status(404).json({ message: "Timetable entry not found" });
  }

  const previousDay = timetable.dayOfWeek;

  if (req.body.title !== undefined) timetable.title = req.body.title?.trim() || timetable.title;
  if (req.body.dayOfWeek !== undefined) timetable.dayOfWeek = req.body.dayOfWeek;
  if (req.body.startTime !== undefined) timetable.startTime = req.body.startTime;
  if (req.body.endTime !== undefined) timetable.endTime = req.body.endTime;
  if (req.body.room !== undefined) timetable.room = req.body.room?.trim() || "";
  if (req.body.notes !== undefined) timetable.notes = req.body.notes?.trim() || "";
  if (req.body.subject !== undefined) timetable.subject = req.body.subject?.trim() || "Mathematics";
  if (req.body.className !== undefined) timetable.className = req.body.className?.trim() || "";
  if (req.body.batchName !== undefined) timetable.batchName = req.body.batchName?.trim() || "";
  if (req.body.course !== undefined) timetable.course = req.body.course || null;
  if (req.body.faculty !== undefined) timetable.faculty = req.body.faculty || null;
  if (req.body.audienceRoles !== undefined) timetable.audienceRoles = Array.isArray(req.body.audienceRoles) && req.body.audienceRoles.length ? req.body.audienceRoles : ["student", "faculty"];
  if (req.body.displayOrder !== undefined) timetable.displayOrder = Number(req.body.displayOrder) || 0;
  if (req.body.isActive !== undefined) timetable.isActive = Boolean(req.body.isActive);

  if (req.body.dayOfWeek !== undefined && previousDay !== timetable.dayOfWeek && req.body.displayOrder === undefined) {
    timetable.displayOrder = await getNextDisplayOrder(timetable.dayOfWeek);
  }

  try {
    await assertTimetableConflicts(timetable, req.params.id);
  } catch (error) {
    return res.status(error.statusCode || 400).json({ message: error.message || "Timetable conflict detected" });
  }

  await timetable.save();
  await timetable.populate("course", "title subject className batchName");
  await timetable.populate("faculty", "name email phone");
  res.json(timetable);
};

export const reorderTimetables = async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  if (!items.length) {
    return res.status(400).json({ message: "No timetable items provided" });
  }

  try {
    await assertReorderConflicts(items);
  } catch (error) {
    return res.status(error.statusCode || 400).json({ message: error.message || "Timetable conflict detected" });
  }

  await Promise.all(items.map((item, index) => Timetable.findByIdAndUpdate(item.id, {
    dayOfWeek: item.dayOfWeek,
    displayOrder: item.displayOrder ?? index + 1
  })));

  const updated = await populateTimetable(Timetable.find()).sort({ dayOfWeek: 1, displayOrder: 1, startTime: 1 });
  res.json(sortTimetable(updated));
};

export const deleteTimetable = async (req, res) => {
  const timetable = await Timetable.findByIdAndDelete(req.params.id);
  if (!timetable) {
    return res.status(404).json({ message: "Timetable entry not found" });
  }

  res.json({ message: "Timetable entry deleted" });
};

export const getMyTimetable = async (req, res) => {
  if (req.user.role === "student") {
    const enrollments = await Enrollment.find({ student: req.user._id, status: "approved" }).select("course");
    const courseIds = enrollments.map((entry) => entry.course);
    const conditions = [];
    if (courseIds.length) conditions.push({ course: { $in: courseIds } });
    if (req.user.studentClass) conditions.push({ className: req.user.studentClass });
    if (!conditions.length) return res.json([]);

    const items = await populateTimetable(Timetable.find({
      isActive: true,
      audienceRoles: "student",
      $or: conditions
    }));

    return res.json(sortTimetable(items));
  }

  if (req.user.role === "faculty") {
    const courses = await Course.find({ faculty: req.user._id }).select("_id");
    const courseIds = courses.map((course) => course._id);
    const conditions = [{ faculty: req.user._id }];
    if (courseIds.length) conditions.push({ course: { $in: courseIds } });

    const items = await populateTimetable(Timetable.find({
      isActive: true,
      audienceRoles: "faculty",
      $or: conditions
    }));

    return res.json(sortTimetable(items));
  }

  return res.status(403).json({ message: "Forbidden" });
};
