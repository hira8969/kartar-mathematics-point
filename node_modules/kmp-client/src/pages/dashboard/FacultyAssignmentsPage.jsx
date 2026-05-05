import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/EmptyState";
import FormField from "../../components/FormField";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { assignmentService } from "../../services/assignmentService";
import { courseService } from "../../services/courseService";
import { formatDate } from "../../utils/formatters";

const emptyForm = {
  title: "",
  instructions: "",
  dueDate: "",
  maxMarks: 100,
  course: ""
};

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const normalized = new Date(date.getTime() - offset * 60000);
  return normalized.toISOString().slice(0, 16);
};

export default function FacultyAssignmentsPage() {
  const { user } = useAuth();
  const { push } = useNotifications();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [gradingId, setGradingId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [grading, setGrading] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [courseList, assignmentList, submissionList] = await Promise.all([
        courseService.getAll(),
        assignmentService.getAll(),
        assignmentService.getSubmissions()
      ]);

      const myCourses = courseList.filter((course) =>
        (course.faculty || []).some((item) => item._id === user?._id || item._id === user?.id)
      );

      const myCourseIds = new Set(myCourses.map((course) => course._id));

      setCourses(myCourses);
      setAssignments(assignmentList.filter((item) => myCourseIds.has(item.course?._id || item.course)));
      setSubmissions(submissionList.filter((item) => myCourseIds.has(item.assignment?.course)));
    } catch (error) {
      push(error.response?.data?.message || "Unable to load assignments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user]);

  useEffect(() => {
    if (!form.course && courses.length === 1 && !editingId) {
      setForm((current) => ({ ...current, course: courses[0]._id }));
    }
  }, [courses, editingId, form.course]);

  const validateForm = () => {
    if (!form.title.trim()) {
      push("Assignment title is required", "error");
      return false;
    }

    if (!form.course) {
      push("Please select a course", "error");
      return false;
    }

    if (!form.dueDate) {
      push("Please choose a due date", "error");
      return false;
    }

    return true;
  };

  const saveAssignment = async () => {
    if (!validateForm()) {
      return;
    }

    setPublishing(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        instructions: form.instructions.trim()
      };

      if (editingId) {
        await assignmentService.update(editingId, payload);
        push("Assignment updated", "success");
      } else {
        await assignmentService.create(payload);
        push("Assignment published", "success");
      }

      setEditingId("");
      setForm(courses.length === 1 ? { ...emptyForm, course: courses[0]._id } : emptyForm);
      await load();
    } catch (error) {
      push(error.response?.data?.message || "Unable to save assignment", "error");
    } finally {
      setPublishing(false);
    }
  };

  const startEditing = (assignment) => {
    setEditingId(assignment._id);
    setForm({
      title: assignment.title || "",
      instructions: assignment.instructions || "",
      dueDate: toDateTimeLocal(assignment.dueDate),
      maxMarks: assignment.maxMarks || 100,
      course: assignment.course?._id || assignment.course || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEditing = () => {
    setEditingId("");
    setForm(courses.length === 1 ? { ...emptyForm, course: courses[0]._id } : emptyForm);
  };

  const gradeSubmission = async (submissionId) => {
    setGradingId(submissionId);
    try {
      await assignmentService.grade(submissionId, grading[submissionId] || { marks: 0, feedback: "" });
      push("Submission graded", "success");
      await load();
    } catch (error) {
      push(error.response?.data?.message || "Unable to save grade", "error");
    } finally {
      setGradingId("");
    }
  };

  const assignmentCountLabel = useMemo(
    () => `${assignments.length} published assignment${assignments.length === 1 ? "" : "s"}`,
    [assignments.length]
  );

  if (loading) return <LoadingState label="Loading assignments..." />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Faculty Assignments" title="Write, publish, and edit assignments" description="Create new work, revise published assignments, and evaluate student submissions from the same page." />
      <SectionCard title={editingId ? "Edit Assignment" : "Write and Publish Assignment"}>
        {courses.length ? (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <FormField label="Assignment title"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
              <FormField label="Due date"><input className="input" type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></FormField>
              <FormField label="Course"><select className="input" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}><option value="">Select course</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select></FormField>
              <FormField label="Max marks"><input className="input" type="number" min="1" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: Number(e.target.value) || 0 })} /></FormField>
              <div className="md:col-span-2"><FormField label="Assignment content / instructions"><textarea className="input min-h-40" placeholder="Write the full assignment question, rules, and submission instructions here" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} /></FormField></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={saveAssignment} disabled={publishing} className="btn-secondary">
                {publishing ? (editingId ? "Updating..." : "Publishing...") : (editingId ? "Update Assignment" : "Publish Assignment")}
              </button>
              {editingId ? <button onClick={cancelEditing} className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">Cancel Edit</button> : null}
            </div>
          </>
        ) : (
          <EmptyState title="No assigned courses" description="Assign a course to this faculty before publishing assignments." />
        )}
      </SectionCard>
      <SectionCard title={`Published Assignments (${assignmentCountLabel})`}>
        <div className="space-y-3">
          {assignments.length ? assignments.map((item) => (
            <div key={item._id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.course?.title} | Due {formatDate(item.dueDate)}</p>
                  <p className="mt-2 text-sm text-slate-600 whitespace-pre-line">{item.instructions || "No instructions provided."}</p>
                </div>
                <button onClick={() => startEditing(item)} className="btn-primary">Edit</button>
              </div>
            </div>
          )) : <EmptyState title="No assignments published" description="Write your first assignment above." />}
        </div>
      </SectionCard>
      <SectionCard title="Submissions to Grade">
        <div className="space-y-4">
          {submissions.length ? submissions.map((submission) => (
            <div key={submission._id} className="rounded-3xl bg-slate-50 p-5">
              <p className="font-semibold">{submission.assignment?.title}</p>
              <p className="text-sm text-slate-600">Student: {submission.student?.name}</p>
              <p className="mt-2 text-sm text-slate-700">{submission.textAnswer || "No text response submitted."}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-[140px_1fr_auto]">
                <input className="input" type="number" placeholder="Marks" value={grading[submission._id]?.marks || ""} onChange={(e) => setGrading((current) => ({ ...current, [submission._id]: { ...(current[submission._id] || {}), marks: Number(e.target.value) } }))} />
                <input className="input" placeholder="Feedback" value={grading[submission._id]?.feedback || ""} onChange={(e) => setGrading((current) => ({ ...current, [submission._id]: { ...(current[submission._id] || {}), feedback: e.target.value } }))} />
                <button onClick={() => gradeSubmission(submission._id)} disabled={gradingId === submission._id} className="btn-primary">
                  {gradingId === submission._id ? "Saving..." : "Save Grade"}
                </button>
              </div>
            </div>
          )) : <EmptyState title="No submissions" description="Student responses will appear here." />}
        </div>
      </SectionCard>
    </div>
  );
}
