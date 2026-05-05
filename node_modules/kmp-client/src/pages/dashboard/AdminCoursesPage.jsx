import { useEffect, useState } from "react";
import EmptyState from "../../components/EmptyState";
import FormField from "../../components/FormField";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useNotifications } from "../../context/NotificationContext";
import { adminService } from "../../services/adminService";
import { courseService } from "../../services/courseService";

export default function AdminCoursesPage() {
  const { push } = useNotifications();
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", className: "10", subject: "Mathematics", syllabus: "", fee: 0, batchName: "" });
  const [facultyMap, setFacultyMap] = useState({});
  const [editingCourseId, setEditingCourseId] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState("");

  const resetForm = () => {
    setForm({ title: "", className: "10", subject: "Mathematics", syllabus: "", fee: 0, batchName: "" });
    setEditingCourseId("");
  };

  const load = async () => {
    setLoading(true);
    try {
      const [courseList, userList] = await Promise.all([courseService.getAll(), adminService.users()]);
      setCourses(courseList);
      setFaculty(userList.filter((user) => user.role === "faculty"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const saveCourse = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      push("Course title is required", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        subject: form.subject.trim() || "Mathematics",
        batchName: form.batchName.trim(),
        syllabus: form.syllabus.trim(),
        fee: Number(form.fee) || 0
      };

      if (editingCourseId) {
        await courseService.update(editingCourseId, payload);
        push("Course updated", "success");
      } else {
        await courseService.create(payload);
        push("Course created", "success");
      }

      resetForm();
      load();
    } finally {
      setSaving(false);
    }
  };

  const startEditCourse = (course) => {
    setEditingCourseId(course._id);
    setForm({
      title: course.title || "",
      className: course.className || "10",
      subject: course.subject || "Mathematics",
      syllabus: course.syllabus || "",
      fee: Number(course.fee) || 0,
      batchName: course.batchName || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeCourse = async (course) => {
    const confirmed = window.confirm(`Remove "${course.title}" course? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingCourseId(course._id);
    try {
      await courseService.remove(course._id);
      push("Course removed", "success");
      if (editingCourseId === course._id) resetForm();
      load();
    } finally {
      setDeletingCourseId("");
    }
  };

  const assignFaculty = async (courseId) => {
    await courseService.update(courseId, { faculty: facultyMap[courseId] ? [facultyMap[courseId]] : [] });
    push("Faculty assigned", "success");
    load();
  };

  if (loading) return <LoadingState label="Loading course management..." />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Course Management" title="Create courses, batches, and faculty assignments" description="Manage Bihar Board class offerings, fees, and batch ownership." />
      <SectionCard
        title={editingCourseId ? "Update Course" : "Create Course"}
        action={editingCourseId ? <button type="button" onClick={resetForm} className="btn-secondary">Cancel edit</button> : null}
      >
        <form onSubmit={saveCourse}>
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Course title"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></FormField>
            <FormField label="Class"><select className="input" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })}>{Array.from({ length: 7 }, (_, index) => index + 6).map((value) => <option key={value} value={String(value)}>Class {value}</option>)}</select></FormField>
            <FormField label="Subject"><input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></FormField>
            <FormField label="Batch"><input className="input" value={form.batchName} onChange={(e) => setForm({ ...form, batchName: e.target.value })} /></FormField>
            <FormField label="Fee"><input className="input" type="number" min="0" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} /></FormField>
            <div className="md:col-span-2"><FormField label="Syllabus"><textarea className="input min-h-28" value={form.syllabus} onChange={(e) => setForm({ ...form, syllabus: e.target.value })} /></FormField></div>
          </div>
          <button disabled={saving} className="btn-secondary mt-4" type="submit">
            {saving ? "Saving..." : editingCourseId ? "Update Course" : "Create Course"}
          </button>
        </form>
      </SectionCard>
      <SectionCard title="Manage Courses">
        <div className="space-y-4">
          {courses.length ? courses.map((course) => (
            <div key={course._id} className="rounded-3xl bg-slate-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{course.title}</p>
                  <p className="text-sm text-slate-600">Class {course.className} | {course.subject || "Mathematics"} | Batch {course.batchName || "General"}</p>
                  <p className="text-sm text-slate-500">Fee: Rs. {course.fee || 0} | Enrolled: {course.enrolledCount || 0}</p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <select className="input min-w-52" value={facultyMap[course._id] || course.faculty?.[0]?._id || ""} onChange={(e) => setFacultyMap((current) => ({ ...current, [course._id]: e.target.value }))}>
                    <option value="">Select faculty</option>
                    {faculty.map((user) => <option key={user._id} value={user._id}>{user.name}</option>)}
                  </select>
                  <button onClick={() => assignFaculty(course._id)} className="btn-primary">Assign</button>
                  <button type="button" onClick={() => startEditCourse(course)} className="btn-secondary">Edit</button>
                  <button type="button" disabled={deletingCourseId === course._id} onClick={() => removeCourse(course)} className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60">
                    {deletingCourseId === course._id ? "Removing..." : "Delete"}
                  </button>
                </div>
              </div>
              {(course.enrolledStudents || []).length ? (
                <div className="mt-4 rounded-2xl bg-white p-4">
                  <p className="text-sm font-semibold text-slate-700">Enrolled Students</p>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {course.enrolledStudents.map((student, index) => (
                      <div key={student.enrollmentId || student._id} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                        <p className="font-semibold text-ink">{index + 1}. {student.name}</p>
                        <p className="text-slate-500">Class {student.studentClass || course.className} | {student.phone || student.email || "No contact"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )) : <EmptyState title="No courses available" description="Create the first course above." />}
        </div>
      </SectionCard>
    </div>
  );
}
