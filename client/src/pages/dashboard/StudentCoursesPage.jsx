import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useNotifications } from "../../context/NotificationContext";
import { courseService } from "../../services/courseService";
import { formatDate } from "../../utils/formatters";

const getIdValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value._id) return String(value._id);
  return String(value);
};

export default function StudentCoursesPage() {
  const { push } = useNotifications();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [allCourses, myEnrollments] = await Promise.all([courseService.getAll(), courseService.getMyEnrollments()]);
      setCourses(allCourses);
      setEnrollments(myEnrollments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const enrolledIds = useMemo(
    () =>
      new Set(
        enrollments
          .filter((item) => item.status !== "rejected" && item.course)
          .map((item) => getIdValue(item.course))
          .filter(Boolean)
      ),
    [enrollments]
  );
  const enrolledCourses = useMemo(
    () => courses.filter((course) => enrolledIds.has(getIdValue(course._id))),
    [courses, enrolledIds]
  );

  const handleEnroll = async (courseId) => {
    await courseService.enroll(courseId);
    push("Course enrollment successful", "success");
    load();
  };

  if (loading) return <LoadingState label="Loading courses..." />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Student Courses" title="Browse and enroll in Mathematics courses" description="Explore Bihar Board mathematics batches for Classes 6 to 12 and access materials after enrollment." />
      <SectionCard title="My Course Updates">
        <div className="space-y-4">
          {enrolledCourses.length ? enrolledCourses.map((course) => (
            <div key={`updates-${course._id}`} className="rounded-3xl bg-slate-50 p-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{course.title}</p>
                  <p className="text-sm text-slate-500">Class {course.className} | Batch {course.batchName || "General"}</p>
                </div>
                <p className="text-sm text-slate-500">{(course.materials || []).length} update{(course.materials || []).length === 1 ? "" : "s"}</p>
              </div>
              <div className="mt-4 space-y-2">
                {(course.materials || []).length ? [...course.materials]
                  .sort((a, b) => new Date(b.uploadedAt || course.updatedAt || 0) - new Date(a.uploadedAt || course.updatedAt || 0))
                  .map((item, index) => (
                    <div key={`${course._id}-material-${index}`} className="rounded-2xl bg-white p-3 text-sm">
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-slate-500">{item.type} | {item.topic || "General"} | {formatDate(item.uploadedAt || course.updatedAt)}</p>
                      {item.url ? (
                        <a className="mt-2 inline-flex font-semibold text-orange-600 hover:text-orange-700" href={item.url} target="_blank" rel="noreferrer">
                          Open file
                        </a>
                      ) : null}
                    </div>
                  )) : <EmptyState title="No updates yet" description="Faculty uploads for this course will appear here." />}
              </div>
            </div>
          )) : <EmptyState title="No enrolled courses" description="Enroll in a course to see faculty updates here." />}
        </div>
      </SectionCard>
      <SectionCard title="Available Courses">
        <div className="grid gap-4 lg:grid-cols-2">
          {courses.length ? courses.map((course) => (
            <div key={course._id} className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{course.title}</p>
                  <p className="text-sm text-slate-500">Class {course.className} | {course.board}</p>
                </div>
                <button disabled={enrolledIds.has(getIdValue(course._id))} onClick={() => handleEnroll(course._id)} className="btn-secondary">
                  {enrolledIds.has(getIdValue(course._id)) ? "Enrolled" : "Enroll"}
                </button>
              </div>
              <p className="mt-3 text-sm text-slate-600">Batch: {course.batchName || "General"}</p>
              <p className="text-sm text-slate-600">Fee: Rs. {course.fee}</p>
              <p className="mt-3 text-sm text-slate-500">{course.syllabus || "Syllabus will be updated by the faculty team."}</p>
              {enrolledIds.has(getIdValue(course._id)) ? (
                <div className="mt-4 space-y-2">
                  {(course.materials || []).length ? [...course.materials]
                    .sort((a, b) => new Date(b.uploadedAt || course.updatedAt || 0) - new Date(a.uploadedAt || course.updatedAt || 0))
                    .slice(0, 3)
                    .map((item, index) => (
                      <div key={`${course._id}-${index}`} className="rounded-2xl bg-white p-3 text-sm">
                        <span className="font-semibold">{item.title}</span>
                        <span className="text-slate-500"> | {item.type} | {item.topic || "General"}</span>
                      </div>
                    )) : <p className="text-sm text-slate-500">No faculty updates yet.</p>}
                </div>
              ) : null}
            </div>
          )) : <EmptyState title="No courses available" description="Admin will publish courses here." />}
        </div>
      </SectionCard>
    </div>
  );
}
