import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/EmptyState";
import FormField from "../../components/FormField";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useNotifications } from "../../context/NotificationContext";
import { attendanceService } from "../../services/attendanceService";
import { courseService } from "../../services/courseService";
import { formatDate } from "../../utils/formatters";

const buildSelectionFromStudents = (students = [], selected = true) => students.reduce((accumulator, student) => {
  accumulator[student._id] = selected;
  return accumulator;
}, {});

export default function FacultyAttendancePage() {
  const { push } = useNotifications();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [form, setForm] = useState({ course: "", date: new Date().toISOString().slice(0, 10) });
  const [selectedStudents, setSelectedStudents] = useState({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [savedRecords, setSavedRecords] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await courseService.getFacultyAttendanceCourses();
      setCourses(data);
      if (data.length && !form.course) {
        setForm((current) => ({ ...current, course: data[0]._id }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeCourse = useMemo(
    () => courses.find((course) => course._id === form.course) || null,
    [courses, form.course]
  );

  const enrolledStudents = activeCourse?.enrolledStudents || [];
  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return enrolledStudents;
    return enrolledStudents.filter((student) =>
      [student.name, student.email, student.phone, student.studentClass]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [enrolledStudents, search]);

  const enrolledCount = activeCourse?.enrolledCount || 0;
  const selectedCount = enrolledStudents.filter((student) => selectedStudents[student._id]).length;
  const absentCount = Math.max(enrolledCount - selectedCount, 0);
  const filteredSelectedCount = filteredStudents.filter((student) => selectedStudents[student._id]).length;
  const allSelected = enrolledStudents.length > 0 && selectedCount === enrolledStudents.length;
  const allFilteredSelected = filteredStudents.length > 0 && filteredSelectedCount === filteredStudents.length;

  useEffect(() => {
    if (!activeCourse || !form.date) {
      setSelectedStudents({});
      setSavedRecords([]);
      return;
    }

    let cancelled = false;
    setRegisterLoading(true);

    attendanceService.getCourseDateRecords(activeCourse._id, form.date)
      .then((records) => {
        if (cancelled) return;
        setSavedRecords(records);
        if (records.length) {
          const nextSelection = buildSelectionFromStudents(enrolledStudents, false);
          records.forEach((record) => {
            if (record.student?._id) {
              nextSelection[record.student._id] = record.status === "present";
            }
          });
          setSelectedStudents(nextSelection);
        } else {
          setSelectedStudents(buildSelectionFromStudents(enrolledStudents, false));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          push(error.response?.data?.message || "Unable to load saved attendance", "error");
          setSelectedStudents(buildSelectionFromStudents(enrolledStudents, false));
          setSavedRecords([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setRegisterLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeCourse, form.date, enrolledStudents, push]);

  const switchCourse = (courseId) => {
    setForm((current) => ({ ...current, course: courseId }));
    setSearch("");
  };

  const toggleStudent = (studentId) => {
    setSelectedStudents((current) => ({ ...current, [studentId]: !current[studentId] }));
  };

  const markAllAbsent = () => {
    setSelectedStudents(buildSelectionFromStudents(enrolledStudents, false));
  };

  const toggleAllFiltered = () => {
    setSelectedStudents((current) => {
      const next = { ...current };
      filteredStudents.forEach((student) => {
        next[student._id] = !allFilteredSelected;
      });
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedStudents(buildSelectionFromStudents(enrolledStudents, !allSelected));
  };

  const submit = async () => {
    if (!form.course) {
      push("Select a course first", "error");
      return;
    }

    const entries = enrolledStudents.map((student) => ({
      student: student._id,
      status: selectedStudents[student._id] ? "present" : "absent"
    }));

    if (!entries.length) {
      push("No enrolled students found for this course", "error");
      return;
    }

    setSaving(true);
    try {
      await attendanceService.mark({ course: form.course, date: form.date, entries });
      push(`Attendance uploaded for ${entries.length} students`, "success");
      const records = await attendanceService.getCourseDateRecords(form.course, form.date);
      setSavedRecords(records);
    } catch (error) {
      push(error.response?.data?.message || "Unable to upload attendance", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading attendance register..." />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Faculty Attendance" title="Mark attendance from enrolled student list" description="Choose your assigned course, keep everyone absent by default, tick only present students, search by student name, and continue from already-saved attendance for the selected date." />
      <SectionCard title="Attendance Register">
        {courses.length ? (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
              <FormField label="Course">
                <select className="input" value={form.course} onChange={(e) => switchCourse(e.target.value)}>
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title} | Class {course.className} | {course.subject}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Date">
                <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </FormField>
              <FormField label="Search Student">
                <input className="input" placeholder="Search by name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </FormField>
            </div>

            {activeCourse ? (
              <div className="space-y-4">
                <div className="rounded-3xl bg-orange-50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-ink">{activeCourse.title}</p>
                      <p className="text-sm text-slate-600">Class {activeCourse.className} | {activeCourse.subject} | {activeCourse.batchName || "General batch"}</p>
                      <p className="text-xs text-slate-500">{savedRecords.length ? `Saved attendance already exists for ${formatDate(form.date)}. You can review and update it below.` : `No saved attendance found for ${formatDate(form.date)} yet.`}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={markAllAbsent} type="button" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                        Mark All Absent
                      </button>
                      <button onClick={toggleAllFiltered} type="button" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                        {allFilteredSelected ? "Unselect Filtered" : "Select Filtered"}
                      </button>
                      <button onClick={toggleAll} type="button" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                        {allSelected ? "Unselect All" : "Select All"}
                      </button>
                      <button onClick={submit} disabled={saving || !enrolledCount || registerLoading} type="button" className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60">
                        {saving ? "Uploading..." : "Upload Attendance"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.75rem] bg-gradient-to-br from-emerald-500 to-green-600 p-5 text-white shadow-xl shadow-emerald-200">
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/80">Present</p>
                    <p className="mt-3 text-4xl font-extrabold">{selectedCount}</p>
                    <p className="mt-2 text-sm text-white/80">Students marked present today</p>
                  </div>
                  <div className="rounded-[1.75rem] bg-gradient-to-br from-rose-500 to-orange-500 p-5 text-white shadow-xl shadow-rose-200">
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/80">Absent</p>
                    <p className="mt-3 text-4xl font-extrabold">{absentCount}</p>
                    <p className="mt-2 text-sm text-white/80">Students still absent</p>
                  </div>
                  <div className="rounded-[1.75rem] bg-gradient-to-br from-sky-500 to-blue-600 p-5 text-white shadow-xl shadow-sky-200">
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/80">Total</p>
                    <p className="mt-3 text-4xl font-extrabold">{enrolledCount}</p>
                    <p className="mt-2 text-sm text-white/80">Approved enrolled students</p>
                  </div>
                </div>

                {registerLoading ? <LoadingState label="Loading saved attendance for selected date..." /> : null}

                {enrolledCount ? (
                  <div className="grid gap-3">
                    {filteredStudents.length ? filteredStudents.map((student, index) => (
                      <label key={student._id} className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-orange-200 hover:bg-orange-50">
                        <div>
                          <p className="font-semibold text-ink">{index + 1}. {student.name}</p>
                          <p className="text-sm text-slate-600">{student.email || student.phone || "No contact info"}</p>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Class {student.studentClass || activeCourse.className}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${selectedStudents[student._id] ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                            {selectedStudents[student._id] ? "Present" : "Absent"}
                          </span>
                          <input
                            type="checkbox"
                            checked={Boolean(selectedStudents[student._id])}
                            onChange={() => toggleStudent(student._id)}
                            className="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                          />
                        </div>
                      </label>
                    )) : <EmptyState title="No matching students" description="Try another search to find enrolled students in this course." />}
                  </div>
                ) : (
                  <EmptyState title="No enrolled students" description="This assigned course does not have any approved student enrollments yet." />
                )}
              </div>
            ) : (
              <EmptyState title="Select a course" description="Choose one of your assigned courses to view the student attendance list." />
            )}
          </div>
        ) : <EmptyState title="No assigned courses" description="Attendance will appear here once admin assigns a course to this faculty." />}
      </SectionCard>
    </div>
  );
}
