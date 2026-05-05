import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import StatCard from "../../components/StatCard";
import { useAsyncData } from "../../hooks/useAsyncData";
import { dashboardService } from "../../services/dashboardService";
import { formatDate } from "../../utils/formatters";

export default function FacultyDashboardPage() {
  const { data, loading, error } = useAsyncData(() => dashboardService.faculty(), []);

  if (loading) return <LoadingState label="Loading faculty dashboard..." />;
  if (error) return <EmptyState title="Dashboard unavailable" description={error} />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Faculty Portal" title="Manage teaching, grading, and exams" description="Keep courses updated with materials, assignments, exams, and announcements." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Assigned Courses" value={data.courses.length} accent="bg-saffron" />
        <StatCard label="Pending Grading" value={data.pendingToGrade} accent="bg-emerald-500" />
        <StatCard label="Assignments Created" value={data.assignmentsCount} accent="bg-sky-500" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Assigned Courses">
          <div className="space-y-3">
            {data.courses.length ? data.courses.map((course) => (
              <div key={course._id} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold">{course.title}</p>
                <p className="text-sm text-slate-600">Class {course.className} | {course.batchName || "General"}</p>
              </div>
            )) : <EmptyState title="No assigned courses" description="Admin will assign courses here." />}
          </div>
        </SectionCard>
        <SectionCard title="Upcoming Exams">
          <div className="space-y-3">
            {data.upcomingExams.length ? data.upcomingExams.map((exam) => (
              <div key={exam._id} className="rounded-2xl bg-orange-50 p-4">
                <p className="font-semibold">{exam.title}</p>
                <p className="text-sm text-slate-600">{formatDate(exam.date, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            )) : <EmptyState title="No upcoming exams" description="Published exams will appear here." />}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
