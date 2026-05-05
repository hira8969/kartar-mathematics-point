import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/EmptyState";
import FileUploadField from "../../components/FileUploadField";
import FormField from "../../components/FormField";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { courseService } from "../../services/courseService";

export default function FacultyCoursesPage() {
  const { user } = useAuth();
  const { push } = useNotifications();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const assignedCourses = await courseService.getFacultyAttendanceCourses();
      setCourses(assignedCourses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user]);

  const courseCount = useMemo(() => courses.length, [courses]);

  const addMaterial = async (courseId) => {
    const material = drafts[courseId];
    if (!material?.title) {
      push("Enter material title before publishing", "error");
      return;
    }
    await courseService.addMaterial(courseId, material);
    push("Study material added", "success");
    setDrafts((current) => ({ ...current, [courseId]: { title: "", type: "note", url: "", topic: "", file: null } }));
    load();
  };

  if (loading) return <LoadingState label="Loading assigned courses..." />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Faculty Courses" title={`Manage ${courseCount} assigned course${courseCount === 1 ? "" : "s"}`} description="Upload notes, PDFs, and video links for your mathematics batches." />
      <SectionCard title="My Courses">
        <div className="space-y-5">
          {courses.length ? courses.map((course) => (
            <div key={course._id} className="rounded-3xl bg-slate-50 p-5">
              <p className="font-semibold">{course.title}</p>
              <p className="text-sm text-slate-500">Class {course.className} | {course.batchName || "General"}</p>
              <p className="mt-1 text-sm font-semibold text-orange-700">{course.enrolledCount || 0} enrolled student{course.enrolledCount === 1 ? "" : "s"}</p>
              <p className="mt-2 text-sm text-slate-600">{course.syllabus || "Syllabus will be updated."}</p>
              <div className="mt-4 rounded-2xl bg-white p-4">
                <p className="text-sm font-semibold text-slate-700">Enrolled Students</p>
                <div className="mt-3 space-y-2">
                  {(course.enrolledStudents || []).length ? course.enrolledStudents.map((student, index) => (
                    <div key={student.enrollmentId || student._id} className="flex flex-col gap-1 rounded-2xl bg-slate-50 px-3 py-2 text-sm md:flex-row md:items-center md:justify-between">
                      <span className="font-semibold text-ink">{index + 1}. {student.name}</span>
                      <span className="text-slate-500">Class {student.studentClass || course.className} | {student.phone || student.email || "No contact"}</span>
                    </div>
                  )) : <EmptyState title="No students enrolled" description="Student enrollments for this course will appear here." />}
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <FormField label="Title"><input className="input" value={drafts[course._id]?.title || ""} onChange={(e) => setDrafts((current) => ({ ...current, [course._id]: { ...(current[course._id] || { type: "note" }), title: e.target.value } }))} /></FormField>
                <FormField label="Type"><select className="input" value={drafts[course._id]?.type || "note"} onChange={(e) => setDrafts((current) => ({ ...current, [course._id]: { ...(current[course._id] || {}), type: e.target.value } }))}><option value="note">Note</option><option value="pdf">PDF</option><option value="video">Video</option></select></FormField>
                <FormField label="URL"><input className="input" value={drafts[course._id]?.url || ""} onChange={(e) => setDrafts((current) => ({ ...current, [course._id]: { ...(current[course._id] || {}), url: e.target.value } }))} /></FormField>
                <FormField label="Topic"><input className="input" value={drafts[course._id]?.topic || ""} onChange={(e) => setDrafts((current) => ({ ...current, [course._id]: { ...(current[course._id] || {}), topic: e.target.value } }))} /></FormField>
              </div>
              <div className="mt-3">
                <FileUploadField label="Upload material file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={(e) => setDrafts((current) => ({ ...current, [course._id]: { ...(current[course._id] || {}), file: e.target.files?.[0] || null } }))} />
              </div>
              <button onClick={() => addMaterial(course._id)} className="btn-primary mt-4">Publish Material</button>
              <div className="mt-4 space-y-2">
                {(course.materials || []).length ? course.materials.map((item, index) => (
                  <div key={`${course._id}-${index}`} className="rounded-2xl bg-white p-3 text-sm text-slate-700">
                    <span className="font-semibold">{item.title}</span> | {item.type} | {item.topic || "General"}
                  </div>
                )) : <EmptyState title="No materials yet" description="Add the first study resource for this batch." />}
              </div>
            </div>
          )) : <EmptyState title="No assigned courses" description="Ask admin to assign a batch or course." />}
        </div>
      </SectionCard>
    </div>
  );
}
