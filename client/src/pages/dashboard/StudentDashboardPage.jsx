import { useMemo } from "react";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import StatCard from "../../components/StatCard";
import { useAsyncData } from "../../hooks/useAsyncData";
import { dashboardService } from "../../services/dashboardService";
import { formatDate } from "../../utils/formatters";

export default function StudentDashboardPage() {
  const { data, loading, error } = useAsyncData(() => dashboardService.student(), []);

  const summary = useMemo(() => {
    if (!data) return [];
    return [
      { label: "Enrolled Courses", value: data.enrollments.length, accent: "bg-saffron" },
      { label: "Upcoming Assignments", value: data.upcomingAssignments.length, accent: "bg-emerald-500" },
      { label: "Upcoming Exams", value: data.upcomingExams.length, accent: "bg-sky-500" },
      { label: "Attendance", value: `${data.attendancePercent}%`, accent: "bg-amber-500" }
    ];
  }, [data]);

  if (loading) return <LoadingState label="Loading student dashboard..." />;
  if (error) return <EmptyState title="Dashboard unavailable" description={error} />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Student Portal" title={data.welcome} description="Track assignments, tests, attendance, and course updates from one place." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => <StatCard key={item.label} label={item.label} value={item.value} accent={item.accent} />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Latest Faculty Updates">
          <div className="space-y-3">
            {data.recentMaterialUpdates.length ? data.recentMaterialUpdates.map((item, index) => (
              <div key={`${item.courseId}-${item.title}-${index}`} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-slate-500">{item.courseTitle} | {item.type.toUpperCase()} | {formatDate(item.uploadedAt)}</p>
                <p className="mt-1 text-sm text-slate-600">{item.topic || "General topic"}</p>
                {item.url ? (
                  <a className="mt-3 inline-flex text-sm font-semibold text-orange-600 hover:text-orange-700" href={item.url} target="_blank" rel="noreferrer">
                    Open update
                  </a>
                ) : null}
              </div>
            )) : <EmptyState title="No course updates" description="Faculty uploads will appear here." />}
          </div>
        </SectionCard>
        <SectionCard title="Upcoming Assignments">
          <div className="space-y-3">
            {data.upcomingAssignments.length ? data.upcomingAssignments.map((item) => (
              <div key={item._id} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-slate-500">Due {formatDate(item.dueDate)}</p>
              </div>
            )) : <EmptyState title="No assignments" description="New homework will appear here." />}
          </div>
        </SectionCard>
        <SectionCard title="Recent Announcements">
          <div className="space-y-3">
            {data.announcements.length ? data.announcements.map((item) => (
              <div key={item._id} className="rounded-2xl bg-orange-50 p-4">
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.message}</p>
              </div>
            )) : <EmptyState title="No announcements" description="Announcements from faculty and admin will appear here." />}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
